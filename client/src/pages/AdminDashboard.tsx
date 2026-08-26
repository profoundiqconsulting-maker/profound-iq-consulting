/* Profound IQ Consulting — Executive Observatory admin workspace. Keep operational tools private, editorial, and calm. */
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bold,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Filter,
  Italic,
  LockKeyhole,
  Mail,
  MailCheck,
  MailWarning,
  Pause,
  Play,
  RefreshCw,
  Save,
  Search,
  Send,
  Share2,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { BrandLogo } from "@/components/BrandLogo";
import AdminInquiryPanel from "@/components/AdminInquiryPanel";
import AdminTranslationSuggestionsPanel from "@/components/AdminTranslationSuggestionsPanel";
import AdminRevenuePanel from "@/components/AdminRevenuePanel";
import AdminStaffPanel from "@/components/AdminStaffPanel";
import AdminCatalogPanel from "@/components/AdminCatalogPanel";
import AdminCourseDeliveryPanel from "@/components/AdminCourseDeliveryPanel";
import AdminPaymentExceptionsPanel from "@/components/AdminPaymentExceptionsPanel";
import AdminSocialPreviewSettings from "@/components/AdminSocialPreviewSettings";
import AdminCourseShareAnalytics from "@/components/AdminCourseShareAnalytics";
import { buildFunnelComparison } from "@shared/adminAnalytics";
import { renderEmailTemplate } from "@shared/emailTemplate";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

function statusLabel(status: string) {
  return status === "paid" ? "Paid" : "Pending";
}
export function toLocalDateKey(value: Date | string | number) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
type PaymentFilter = "all" | "paid" | "pending";
type ScoreFilter = "all" | "high" | "mid" | "developing" | "locked";
type TemplateKey = "assessment_report" | "course_enrollment";
const templateDefaults: Record<
  TemplateKey,
  { label: string; subject: string; body: string }
> = {
  assessment_report: {
    label: "Assessment report delivery",
    subject: "Your Profound IQ assessment report",
    body: "Hello {{name}},\n\nYour assessment report is ready. Use the secure link in your dashboard to review your development signals.\n\nProfound IQ Consulting",
  },
  course_enrollment: {
    label: "Course enrollment follow-up",
    subject: "Your Profound IQ course inquiry",
    body: "Hello {{name}},\n\nThank you for your interest in {{course}}. Our team will follow up with availability and next steps.\n\nProfound IQ Consulting",
  },
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const overview = trpc.assessment.adminOverview.useQuery(undefined, {
    enabled: Boolean(user?.role === "admin"),
    retry: false,
  });
  const [psychometricPaymentFilter, setPsychometricPaymentFilter] = useState<"all" | "pending" | "paid">("all");
  const [psychometricFrom, setPsychometricFrom] = useState("");
  const [psychometricTo, setPsychometricTo] = useState("");
  const psychometricAnalytics = trpc.admin.psychometricAnalytics.useQuery({ fromDate: psychometricFrom || undefined, toDate: psychometricTo || undefined }, { enabled: Boolean(user?.role === "admin"), retry: false, refetchInterval: 30000, refetchOnWindowFocus: true });
  const psychometricAttempts = trpc.admin.psychometricAttempts.useQuery({ paymentStatus: psychometricPaymentFilter, fromDate: psychometricFrom || undefined, toDate: psychometricTo || undefined, limit: 100, offset: 0 }, { enabled: Boolean(user?.role === "admin"), retry: false });
  const exportPsychometricAnalytics = trpc.admin.exportPsychometricAnalytics.useMutation({ onError: (error) => toast.error("Analytics export failed", { description: error.message }) });
  const downloadPsychometricAnalytics = async (format: "csv" | "excel" | "pdf") => { try { const result = await exportPsychometricAnalytics.mutateAsync({ format, fromDate: psychometricFrom || undefined, toDate: psychometricTo || undefined }); const bytes = format === "pdf" ? Uint8Array.from(atob(result.data), (character) => character.charCodeAt(0)) : new TextEncoder().encode(result.data); const url = URL.createObjectURL(new Blob([bytes], { type: result.contentType })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = result.filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); toast.success(`${format === "excel" ? "Excel" : format.toUpperCase()} analytics downloaded`); } catch { /* mutation callback provides feedback */ } };
  const psychometricSchedule = trpc.admin.psychometricWeeklySchedule.useQuery(undefined, { enabled: Boolean(user?.role === "admin"), retry: false });
  const enablePsychometricSchedule = trpc.admin.enablePsychometricWeeklySchedule.useMutation({ onSuccess: () => { psychometricSchedule.refetch(); toast.success("Weekly analytics delivery enabled"); }, onError: (error) => toast.error("Could not enable weekly delivery", { description: error.message }) });
  const setPsychometricSchedulePaused = trpc.admin.setPsychometricWeeklySchedulePaused.useMutation({ onSuccess: () => { psychometricSchedule.refetch(); toast.success("Weekly analytics schedule updated"); }, onError: (error) => toast.error("Could not update schedule", { description: error.message }) });
  const psychometricAcknowledgementAudit = trpc.admin.psychometricAcknowledgementAudit.useQuery({ limit: 250 }, { enabled: Boolean(user?.role === "admin"), retry: false });
  const exportPsychometricAcknowledgementAudit = trpc.admin.exportPsychometricAcknowledgementAudit.useMutation({ onError: (error) => toast.error("Audit export failed", { description: error.message }) });
  const downloadPsychometricAcknowledgementAudit = async () => { try { const result = await exportPsychometricAcknowledgementAudit.mutateAsync({ limit: 250 }); const url = URL.createObjectURL(new Blob([result.data], { type: result.contentType })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = result.filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); toast.success("Acknowledgement audit downloaded"); } catch { /* mutation callback provides feedback */ } };
  const failedPsychometricDeliveries = trpc.admin.psychometricFailedDeliveries.useQuery({ limit: 50 }, { enabled: Boolean(user?.role === "admin"), retry: false, refetchInterval: 30000 });
  const acknowledgePsychometricDelivery = trpc.admin.acknowledgePsychometricDelivery.useMutation({ onSuccess: () => { failedPsychometricDeliveries.refetch(); psychometricAnalytics.refetch(); toast.success("Delivery failure acknowledged"); }, onError: (error) => toast.error("Acknowledgement failed", { description: error.message }) });
  const [analyticsFrom, setAnalyticsFrom] = useState("");
  const [analyticsTo, setAnalyticsTo] = useState("");
  const [loginGranularity, setLoginGranularity] = useState<"daily" | "weekly">(
    "weekly"
  );
  const analyticsInput = useMemo(
    () =>
      analyticsFrom || analyticsTo
        ? {
            fromDate: analyticsFrom || undefined,
            toDate: analyticsTo || undefined,
          }
        : undefined,
    [analyticsFrom, analyticsTo]
  );
  const loginAnalyticsInput = useMemo(
    () => ({ ...(analyticsInput ?? {}), granularity: loginGranularity }),
    [analyticsInput, loginGranularity]
  );
  const analytics = trpc.admin.analyticsSummary.useQuery(analyticsInput, {
    enabled: Boolean(user?.role === "admin"),
    retry: false,
  });
  const shareAnalytics = trpc.admin.careerPathShareAnalytics.useQuery(
    undefined,
    { enabled: Boolean(user?.role === "admin"), retry: false }
  );
  const analyticsSettings = trpc.admin.analyticsSettings.useQuery(undefined, {
    enabled: Boolean(user?.role === "admin"),
    retry: false,
  });
  const templates = trpc.admin.emailTemplates.useQuery(undefined, {
    enabled: Boolean(user?.role === "admin"),
    retry: false,
  });
  const scheduleStatus = trpc.admin.scheduledExportStatus.useQuery(undefined, {
    enabled: Boolean(user?.role === "admin"),
    retry: false,
  });
  const [deliverySearch, setDeliverySearch] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<
    "all" | "sent" | "failed"
  >("all");
  const [deliveryFrom, setDeliveryFrom] = useState("");
  const [deliveryTo, setDeliveryTo] = useState("");
  const [deliveryPage, setDeliveryPage] = useState(1);
  const deliveryInput = useMemo(
    () => ({
      page: deliveryPage,
      pageSize: 12,
      search: deliverySearch || undefined,
      status: deliveryStatus,
      fromDate: deliveryFrom || undefined,
      toDate: deliveryTo || undefined,
    }),
    [deliveryFrom, deliveryPage, deliverySearch, deliveryStatus, deliveryTo]
  );
  const emailPreviewHistory = trpc.admin.emailPreviewHistory.useQuery(
    deliveryInput,
    { enabled: Boolean(user?.role === "admin"), retry: false }
  );
  const deliveryLogExportJobs = trpc.admin.deliveryLogExportJobs.useQuery(
    undefined,
    {
      enabled: Boolean(user?.role === "admin"),
      retry: false,
      refetchInterval: 8000,
    }
  );
  const [verificationSearch, setVerificationSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const [verificationPage, setVerificationPage] = useState(1);
  const [revokeTarget, setRevokeTarget] = useState<{
    openId: string;
    email: string | null;
  } | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [auditAdminSearch, setAuditAdminSearch] = useState("");
  const [auditFromDate, setAuditFromDate] = useState("");
  const [auditToDate, setAuditToDate] = useState("");
  const [auditPage, setAuditPage] = useState(1);
  const auditInput = useMemo(
    () => ({
      page: auditPage,
      pageSize: 8,
      adminSearch: auditAdminSearch || undefined,
      fromDate: auditFromDate || undefined,
      toDate: auditToDate || undefined,
    }),
    [auditAdminSearch, auditFromDate, auditPage, auditToDate]
  );
  const revocationAudits = trpc.admin.verificationRevocationAudits.useQuery(
    auditInput,
    { enabled: Boolean(user?.role === "admin"), retry: false }
  );
  const exportVerificationAudits =
    trpc.admin.exportVerificationRevocationAudits.useQuery(
      {
        adminSearch: auditAdminSearch || undefined,
        fromDate: auditFromDate || undefined,
        toDate: auditToDate || undefined,
      },
      { enabled: false, retry: false }
    );
  const userVerificationReview = trpc.admin.userVerificationReview.useQuery(
    {
      page: verificationPage,
      pageSize: 8,
      search: verificationSearch || undefined,
      verification: verificationFilter,
    },
    { enabled: Boolean(user?.role === "admin"), retry: false }
  );
  const [securityFromDate, setSecurityFromDate] = useState("");
  const [securityToDate, setSecurityToDate] = useState("");
  const [securityIpSearch, setSecurityIpSearch] = useState("");
  const [securityLocationSearch, setSecurityLocationSearch] = useState("");
  const [securityPage, setSecurityPage] = useState(1);
  const [unlockAuditPage, setUnlockAuditPage] = useState(1);
  const [unlockAuditSearch, setUnlockAuditSearch] = useState("");
  const [exportHistoryPage, setExportHistoryPage] = useState(1);
  const [exportHistorySearch, setExportHistorySearch] = useState("");
  const [exportHistoryFrom, setExportHistoryFrom] = useState("");
  const [exportHistoryTo, setExportHistoryTo] = useState("");
  const [revocationAuditPage, setRevocationAuditPage] = useState(1);
  const [revocationAuditSearch, setRevocationAuditSearch] = useState("");
  const [revocationAuditActor, setRevocationAuditActor] = useState("");
  const [revocationAuditFrom, setRevocationAuditFrom] = useState("");
  const [revocationAuditTo, setRevocationAuditTo] = useState("");
  const [unlockAuditFrom, setUnlockAuditFrom] = useState("");
  const [unlockAuditTo, setUnlockAuditTo] = useState("");
  const [adminResetEmail, setAdminResetEmail] = useState("");
  const [adminResetLink, setAdminResetLink] = useState<string | null>(null);
  const [adminResetExpiresAt, setAdminResetExpiresAt] = useState<number | null>(null);
  const [adminResetRemaining, setAdminResetRemaining] = useState(0);
  const [adminResetCopied, setAdminResetCopied] = useState(false);
  const [confirmResetRevocation, setConfirmResetRevocation] = useState(false);
  const securitySettings = trpc.admin.securitySettings.useQuery(undefined, {
    enabled: Boolean(user?.role === "admin"),
    retry: false,
  });
  const failedLoginEvents = trpc.admin.failedLoginEvents.useQuery(
    {
      page: securityPage,
      pageSize: 10,
      fromDate: securityFromDate || undefined,
      toDate: securityToDate || undefined,
      ipSearch: securityIpSearch || undefined,
      locationSearch: securityLocationSearch || undefined,
    },
    { enabled: Boolean(user?.role === "admin"), retry: false }
  );
  const loginSecurityAnalytics = trpc.admin.loginSecurityAnalytics.useQuery(
    loginAnalyticsInput,
    { enabled: Boolean(user?.role === "admin"), retry: false }
  );
  const failedLoginRegions = trpc.admin.failedLoginRegions.useQuery(
    { fromDate: securityFromDate || undefined, toDate: securityToDate || undefined },
    { enabled: Boolean(user?.role === "admin"), retry: false }
  );
  const unlockAuditHistory = trpc.admin.unlockAuditHistory.useQuery(
    { page: unlockAuditPage, pageSize: 8, targetSearch: unlockAuditSearch || undefined, fromDate: unlockAuditFrom || undefined, toDate: unlockAuditTo || undefined },
    { enabled: Boolean(user?.role === "admin"), retry: false }
  );
  const unlockAuditExportHistory = trpc.admin.unlockAuditExportHistory.useQuery({ page: exportHistoryPage, pageSize: 8, search: exportHistorySearch || undefined, fromDate: exportHistoryFrom || undefined, toDate: exportHistoryTo || undefined }, { enabled: Boolean(user?.role === "admin"), retry: false });
  const exportUnlockAuditHistory = trpc.admin.exportUnlockAuditExportHistory.useQuery({ search: exportHistorySearch || undefined, fromDate: exportHistoryFrom || undefined, toDate: exportHistoryTo || undefined }, { enabled: false, retry: false });
  const resetLinkRevocationHistory = trpc.admin.resetLinkRevocationHistory.useQuery({ page: revocationAuditPage, pageSize: 8, search: revocationAuditSearch || undefined, actorSearch: revocationAuditActor || undefined, fromDate: revocationAuditFrom || undefined, toDate: revocationAuditTo || undefined }, { enabled: Boolean(user?.role === "admin"), retry: false });
  const exportResetLinkRevocations = trpc.admin.exportResetLinkRevocations.useQuery({ search: revocationAuditSearch || undefined, actorSearch: revocationAuditActor || undefined, fromDate: revocationAuditFrom || undefined, toDate: revocationAuditTo || undefined }, { enabled: false, retry: false });
  const revokeAdminResetLink = trpc.admin.revokeAdminResetLink.useMutation({ onSuccess: result => { setAdminResetLink(null); setAdminResetExpiresAt(null); toast.success(`Reset link revoked for ${result.email}`); }, onError: error => toast.error("Could not revoke reset link", { description: error.message }) });
  const generateAdminResetLink = trpc.admin.generateAdminResetLink.useMutation({ onSuccess: result => { setAdminResetLink(result.resetUrl); setAdminResetExpiresAt(new Date(result.expiresAt).getTime()); setAdminResetCopied(false); toast.success("One-time reset link generated", { description: "Copy it now; it expires in 10 minutes and is not stored in the console." }); }, onError: error => toast.error("Could not generate reset link", { description: error.message }) });
  useEffect(() => { if (!adminResetExpiresAt) return; const update = () => setAdminResetRemaining(Math.max(0, Math.ceil((adminResetExpiresAt - Date.now()) / 1000))); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, [adminResetExpiresAt]);
  const saveSecuritySettings = trpc.admin.saveSecuritySettings.useMutation({
    onSuccess: () => securitySettings.refetch(),
  });
  const unlockUserLogin = trpc.admin.unlockUserLogin.useMutation({
    onSuccess: result => {
      failedLoginEvents.refetch();
      unlockAuditHistory.refetch();
      toast.success(result.clearedAttemptCount ? "User account unlocked" : "No active lockout found", { description: result.clearedAttemptCount ? `${result.clearedAttemptCount} active rate-limit record(s) cleared.` : "The account is already clear." });
    },
    onError: error => toast.error("Could not unlock account", { description: error.message }),
  });
  const exportUnlockAudits = trpc.admin.exportUnlockAudits.useQuery({ targetSearch: unlockAuditSearch || undefined, fromDate: unlockAuditFrom || undefined, toDate: unlockAuditTo || undefined }, { enabled: false, retry: false });
  useEffect(() => { if (!exportUnlockAudits.data) return; const blob = new Blob([exportUnlockAudits.data.data], { type: exportUnlockAudits.data.contentType }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = exportUnlockAudits.data.filename; anchor.click(); URL.revokeObjectURL(url); toast.success("Unlock audit CSV downloaded"); }, [exportUnlockAudits.data]);
  const exportSecurityLogs = trpc.admin.exportSecurityLoginEvents.useQuery(
    {
      fromDate: securityFromDate || undefined,
      toDate: securityToDate || undefined,
      ipSearch: securityIpSearch || undefined,
      locationSearch: securityLocationSearch || undefined,
    },
    { enabled: false, retry: false }
  );
  const [alertThreshold, setAlertThreshold] = useState(5);
  const [reviewWindowDays, setReviewWindowDays] = useState(7);
  const [loginEventRetentionDays, setLoginEventRetentionDays] = useState(90);
  const [lockoutWindowSeconds, setLockoutWindowSeconds] = useState(60);
  const saveTemplate = trpc.admin.saveEmailTemplate.useMutation();
  const sendTemplateTest = trpc.admin.sendTemplateTestEmail.useMutation();
  const enableWeeklyExport = trpc.admin.enableWeeklyExport.useMutation();
  const saveAnalyticsSettings = trpc.admin.saveAnalyticsSettings.useMutation({
    onSuccess: () => analyticsSettings.refetch(),
  });
  const updateExportRetention = trpc.admin.updateExportRetention.useMutation({
    onSuccess: () => scheduleStatus.refetch(),
  });
  const retryTemplateTestEmail = trpc.admin.retryTemplateTestEmail.useMutation({
    onSettled: () => emailPreviewHistory.refetch(),
  });
  const revokeUserEmailVerification =
    trpc.admin.revokeUserEmailVerification.useMutation({
      onSuccess: () => {
        setRevokeTarget(null);
        setRevokeReason("");
        userVerificationReview.refetch();
        revocationAudits.refetch();
      },
    });
  const queueDeliveryLogExport = trpc.admin.queueDeliveryLogExport.useMutation({
    onSuccess: () => deliveryLogExportJobs.refetch(),
  });
  const enableDeliveryLogExportWorker =
    trpc.admin.enableDeliveryLogExportWorker.useMutation({
      onSuccess: () => deliveryLogExportJobs.refetch(),
    });
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportStatus, setExportStatus] = useState("all");
  const exportInput = useMemo(
    () => ({
      fromDate: exportFrom || undefined,
      toDate: exportTo || undefined,
      status: exportStatus as "all" | "new" | "contacted" | "enrolled",
    }),
    [exportFrom, exportStatus, exportTo]
  );
  const exportEnrollments = trpc.admin.exportCourseEnrollments.useQuery(
    exportInput,
    { enabled: false, retry: false }
  );
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [templateKey, setTemplateKey] =
    useState<TemplateKey>("assessment_report");
  const [templateLabel, setTemplateLabel] = useState(
    templateDefaults.assessment_report.label
  );
  const [templateSubject, setTemplateSubject] = useState(
    templateDefaults.assessment_report.subject
  );
  const [templateBody, setTemplateBody] = useState(
    templateDefaults.assessment_report.body
  );
  const [templateSaved, setTemplateSaved] = useState(false);
  const templateBodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!securitySettings.data) return;
    setAlertThreshold(securitySettings.data.alertThreshold);
    setReviewWindowDays(securitySettings.data.reviewWindowDays);
    setLoginEventRetentionDays(
      securitySettings.data.loginEventRetentionDays ?? 90
    );
    setLockoutWindowSeconds(securitySettings.data.lockoutWindowSeconds ?? 60);
  }, [securitySettings.data]);

  useEffect(() => {
    const saved = templates.data?.find(
      template => template.templateKey === templateKey
    );
    const fallback = templateDefaults[templateKey];
    setTemplateLabel(saved?.label ?? fallback.label);
    setTemplateSubject(saved?.subject ?? fallback.subject);
    setTemplateBody(saved?.body ?? fallback.body);
    setTemplateSaved(false);
  }, [templateKey, templates.data]);

  const filteredAttempts = useMemo(
    () =>
      overview.data?.attempts.filter(attempt => {
        const createdAtKey = toLocalDateKey(attempt.createdAt);
        const score = attempt.overallScore;
        const paymentMatch =
          paymentFilter === "all" ||
          (paymentFilter === "paid"
            ? attempt.paymentStatus === "paid"
            : attempt.paymentStatus !== "paid");
        const dateMatch =
          (!fromDate || createdAtKey >= fromDate) &&
          (!toDate || createdAtKey <= toDate);
        const scoreMatch =
          scoreFilter === "all" ||
          (scoreFilter === "locked"
            ? score === null
            : score !== null &&
              (scoreFilter === "high"
                ? score >= 80
                : scoreFilter === "mid"
                  ? score >= 60 && score < 80
                  : score < 60));
        return paymentMatch && dateMatch && scoreMatch;
      }) ?? [],
    [fromDate, overview.data, paymentFilter, scoreFilter, toDate]
  );
  const filteredSummary = useMemo(
    () => ({
      total: filteredAttempts.length,
      paid: filteredAttempts.filter(attempt => attempt.paymentStatus === "paid")
        .length,
      pending: filteredAttempts.filter(
        attempt => attempt.paymentStatus !== "paid"
      ).length,
    }),
    [filteredAttempts]
  );
  const analyticsData = useMemo(
    () => [
      {
        label: "Assessment starts",
        value: analytics.data?.summary.assessment_started ?? 0,
      },
      {
        label: "Payments",
        value: analytics.data?.summary.payment_completed ?? 0,
      },
      {
        label: "Reports downloaded",
        value: analytics.data?.summary.report_downloaded ?? 0,
      },
      {
        label: "Course inquiries",
        value: analytics.data?.summary.course_enrollment_submitted ?? 0,
      },
    ],
    [analytics.data]
  );
  const weeklyTrendData = analytics.data?.weekly ?? [];
  const [paidBenchmark, setPaidBenchmark] = useState(35);
  const [downloadBenchmark, setDownloadBenchmark] = useState(60);
  const [retentionDays, setRetentionDays] = useState(30);
  const funnelData = useMemo(
    () =>
      buildFunnelComparison(
        analytics.data?.summary ?? {},
        analytics.data?.previousSummary ?? {},
        { paid: paidBenchmark, downloaded: downloadBenchmark }
      ),
    [analytics.data, downloadBenchmark, paidBenchmark]
  );
  const filteredPreviewHistory = emailPreviewHistory.data?.rows ?? [];
  useEffect(() => {
    if (analyticsSettings.data) {
      setPaidBenchmark(analyticsSettings.data.paidBenchmark);
      setDownloadBenchmark(analyticsSettings.data.downloadBenchmark);
    }
  }, [analyticsSettings.data]);
  useEffect(() => {
    if (scheduleStatus.data?.config?.retentionDays)
      setRetentionDays(scheduleStatus.data.config.retentionDays);
  }, [scheduleStatus.data]);
  const hasFilters =
    paymentFilter !== "all" ||
    scoreFilter !== "all" ||
    Boolean(fromDate) ||
    Boolean(toDate);
  const resetFilters = () => {
    setPaymentFilter("all");
    setScoreFilter("all");
    setFromDate("");
    setToDate("");
  };
  const previewBody = renderEmailTemplate(templateBody, {
    name: "Amina Otieno",
    email: "amina@example.com",
    date: new Date().toLocaleDateString(),
    course: "Lead with Clarity",
  });
  const applyFormat = (prefix: string, suffix = prefix) => {
    const textarea = templateBodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = templateBody.slice(start, end) || "text";
    const next = `${templateBody.slice(0, start)}${prefix}${selected}${suffix}${templateBody.slice(end)}`;
    setTemplateBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    });
  };
  const handleSaveTemplate = () => {
    saveTemplate.mutate(
      {
        templateKey,
        label: templateLabel,
        subject: templateSubject,
        body: templateBody,
      },
      {
        onSuccess: () => {
          setTemplateSaved(true);
          templates.refetch();
        },
      }
    );
  };
  const handleSendTest = () => {
    sendTemplateTest.mutate(
      { templateKey, subject: templateSubject, body: templateBody },
      { onSuccess: () => emailPreviewHistory.refetch() }
    );
  };
  const handleDeliveryFilterChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setDeliveryPage(1);
  };
  const handleVerificationFilterChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setVerificationPage(1);
  };
  const handleEnableWeeklyExport = () => {
    enableWeeklyExport.mutate(undefined, {
      onSuccess: () => scheduleStatus.refetch(),
    });
  };
  const handleSaveBenchmarks = () => {
    saveAnalyticsSettings.mutate({ paidBenchmark, downloadBenchmark });
  };
  const handleExportSecurityLogs = async () => {
    const result = await exportSecurityLogs.refetch();
    if (!result.data) return;
    const blob = new Blob([result.data.data], {
      type: result.data.contentType,
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const handleRetentionSave = (value: number) => {
    updateExportRetention.mutate({ retentionDays: value });
  };
  const handleExport = async () => {
    const result = await exportEnrollments.refetch();
    if (!result.data) return;
    const blob = new Blob([result.data.data], {
      type: result.data.contentType,
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const handleAuditExport = async () => {
    const result = await exportVerificationAudits.refetch();
    if (!result.data) return;
    const blob = new Blob([result.data.data], {
      type: result.data.contentType,
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const handleDeliveryExport = () => {
    queueDeliveryLogExport.mutate({
      search: deliverySearch || undefined,
      status: deliveryStatus,
      fromDate: deliveryFrom || undefined,
      toDate: deliveryTo || undefined,
    });
  };
  const handleRevokeVerification = (openId: string, email: string | null) => {
    setRevokeTarget({ openId, email });
    setRevokeReason("");
  };

  if (authLoading)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f3e8] text-[#16243d]">
        <RefreshCw className="animate-spin text-[#a27e2e]" />
      </div>
    );
  if (!user)
    return (
      <AccessState
        title="Sign in required"
        message="This workspace is reserved for Profound IQ Consulting administrators."
      />
    );
  if (user.role !== "admin")
    return (
      <AccessState
        title="Admin access only"
        message="Your account is authenticated, but it does not have permission to view assessment records."
      />
    );

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <header className="border-b border-[#16243d]/15 bg-[#101d35] text-[#f7f3e8]">
        <div className="container flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo context="admin" compactOnMobile />
            <span className="text-[11px] font-extrabold tracking-[.18em]">
              / ADMIN
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#c1cad7] hover:text-[#c9a34e]"
          >
            <ArrowLeft size={14} /> Back to site
          </Link>
        </div>
      </header>
      <main className="container py-10 sm:py-14 lg:py-20">
        <div className="flex flex-col justify-between gap-6 border-b border-[#16243d]/20 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-[#a27e2e]">
              Private workspace / assessment intelligence
            </p>
            <h1 className="display mt-4 text-5xl leading-none tracking-[-.04em] sm:text-6xl">
              The <em className="font-normal text-[#a27e2e]">signal</em> room.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#4a566a]">
              Manage assessment records, follow up on course interest, and keep
              future communications on-brand.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#657084]">
            <LockKeyhole size={15} className="text-[#a27e2e]" /> Admin only
          </div>
        </div>
        <AdminSocialPreviewSettings />
        <AdminCourseShareAnalytics />
        {overview.isLoading && (
          <div className="mt-10 flex items-center gap-3 border-l-2 border-[#c9a34e] bg-white/50 px-5 py-4 text-sm">
            <RefreshCw size={16} className="animate-spin text-[#a27e2e]" />{" "}
            Loading assessment records…
          </div>
        )}
        {overview.isError && (
          <div className="mt-10 flex items-start gap-3 border-l-2 border-red-700 bg-red-50 px-5 py-4 text-sm text-red-900">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Unable to load assessment records.</p>
              <p className="mt-1">
                Check the database connection and try again.
              </p>
            </div>
          </div>
        )}
        <AdminRevenuePanel />
        <AdminStaffPanel />
        <AdminCatalogPanel />
        <AdminCourseDeliveryPanel />
        <AdminPaymentExceptionsPanel />
        <section className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 border-b border-[#16243d]/10 pb-5 sm:flex-row sm:items-end"><div><p className="eyebrow text-[#a27e2e]">Psychometric suite / conversion intelligence</p><h2 className="display mt-2 text-2xl">From start to delivered report.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">Track real attempts, verified payments, and report-email outcomes by profile and selected date range.</p></div><div className="flex flex-wrap gap-2"><input type="date" value={psychometricFrom} onChange={(event) => setPsychometricFrom(event.target.value)} aria-label="Psychometric analytics start date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm" /><input type="date" value={psychometricTo} onChange={(event) => setPsychometricTo(event.target.value)} aria-label="Psychometric analytics end date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm" /><button type="button" onClick={() => downloadPsychometricAnalytics("csv")} disabled={exportPsychometricAnalytics.isPending} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-50"><Download size={13} /> CSV</button><button type="button" onClick={() => downloadPsychometricAnalytics("excel")} disabled={exportPsychometricAnalytics.isPending} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-50"><Download size={13} /> Excel</button><button type="button" onClick={() => downloadPsychometricAnalytics("pdf")} disabled={exportPsychometricAnalytics.isPending} className="inline-flex items-center gap-2 bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] text-[#f7f3e8] disabled:opacity-50"><FileText size={13} /> PDF</button></div></div>{Boolean((psychometricAnalytics.data?.totals.failed ?? 0) > 0) && <div role="alert" className="mt-5 flex items-start gap-3 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900"><MailWarning size={18} className="mt-0.5 shrink-0" /><div><strong>Report delivery attention required.</strong><p className="mt-1">{psychometricAnalytics.data?.totals.failed} psychometric report email{psychometricAnalytics.data?.totals.failed === 1 ? "" : "s"} failed. Review the delivery status below and use the learner resend workflow when appropriate.</p></div></div>}{psychometricAnalytics.isLoading ? <p className="mt-5 text-sm text-[#657084]">Loading psychometric analytics…</p> : <><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={FileText} label="Starts" value={psychometricAnalytics.data?.totals.started ?? 0} /><Metric icon={CheckCircle2} label="Paid conversion" value={`${psychometricAnalytics.data?.totals.conversionRate ?? 0}%`} accent /><Metric icon={MailCheck} label="Email delivery" value={`${psychometricAnalytics.data?.totals.emailRate ?? 0}%`} /><Metric icon={MailWarning} label="Pending / failed" value={(psychometricAnalytics.data?.totals.pending ?? 0) + (psychometricAnalytics.data?.totals.failed ?? 0)} /></div><div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="border border-[#16243d]/10 bg-[#fffaf0] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#a27e2e]">Profile conversion</p><div className="mt-3 space-y-3">{(psychometricAnalytics.data?.byProfile ?? []).map((profile) => <div key={profile.testSlug}><div className="flex items-center justify-between gap-3 text-xs"><span className="font-bold">{profile.testSlug}</span><span>{profile.paid}/{profile.started} paid · {profile.emailRate}% emailed</span></div><div className="mt-1 h-2 bg-[#16243d]/10"><div className="h-full bg-[#c9a34e]" style={{ width: `${profile.conversionRate}%` }} /></div></div>)}{!(psychometricAnalytics.data?.byProfile?.length) && <p className="text-sm text-[#657084]">No psychometric attempts in this range.</p>}</div></div><div className="border border-[#16243d]/10 bg-[#fffaf0] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#a27e2e]">Recent funnel trend</p><div className="mt-4 space-y-2">{(psychometricAnalytics.data?.trend ?? []).slice(-7).map((point) => <div key={point.date} className="grid grid-cols-[75px_1fr] items-center gap-3 text-xs"><span className="text-[#657084]">{point.date.slice(5)}</span><div className="flex h-5 overflow-hidden bg-[#16243d]/10"><div className="bg-[#16243d]" style={{ width: `${point.started ? Math.max(4, (point.paid / point.started) * 100) : 0}%` }} title={`${point.paid} paid of ${point.started} starts`} /><div className="bg-[#c9a34e]" style={{ width: `${point.started ? Math.max(0, ((point.sent - point.paid) / point.started) * 100) : 0}%` }} /></div></div>)}{!(psychometricAnalytics.data?.trend?.length) && <p className="text-sm text-[#657084]">Trend data will appear after attempts are recorded.</p>}</div></div></div></>}</section>
        <section className="mt-10 border border-[#c9a34e]/45 bg-[#fffaf0] p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 border-b border-[#16243d]/10 pb-5 sm:flex-row sm:items-end"><div><p className="eyebrow text-[#a27e2e]">Psychometric suite / operations</p><h2 className="display mt-2 text-2xl">Profile attempts and delivery.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">Review payment state, report readiness, and email delivery without exposing raw responses or report payloads.</p></div><span className="text-xs font-bold text-[#7d5e1e]">{psychometricAttempts.data?.length ?? 0} shown</span></div><div className="mt-5 flex flex-wrap gap-3"><select value={psychometricPaymentFilter} onChange={(event) => setPsychometricPaymentFilter(event.target.value as "all" | "pending" | "paid")} className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm" aria-label="Psychometric payment status"><option value="all">All payments</option><option value="paid">Paid</option><option value="pending">Pending</option></select><input type="date" value={psychometricFrom} onChange={(event) => setPsychometricFrom(event.target.value)} aria-label="Psychometric attempts from date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm" /><input type="date" value={psychometricTo} onChange={(event) => setPsychometricTo(event.target.value)} aria-label="Psychometric attempts to date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm" /></div>{psychometricAttempts.isLoading ? <p className="mt-5 text-sm text-[#657084]">Loading psychometric attempts…</p> : psychometricAttempts.isError ? <p className="mt-5 text-sm text-red-800">Unable to load psychometric attempts.</p> : psychometricAttempts.data?.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#16243d]/15 text-[10px] uppercase tracking-[.12em] text-[#657084]"><tr><th className="py-3">Participant</th><th className="py-3">Profile</th><th className="py-3">Payment</th><th className="py-3">Score</th><th className="py-3">Email delivery</th><th className="py-3">Created</th></tr></thead><tbody>{psychometricAttempts.data.map((attempt) => <tr key={attempt.id} className="border-b border-[#16243d]/10"><td className="py-3"><strong>{attempt.name}</strong><span className="block text-xs text-[#657084]">{attempt.email}</span></td><td className="py-3 text-xs">{attempt.testSlug}</td><td className="py-3"><span className={attempt.paymentStatus === "paid" ? "font-bold text-emerald-800" : "font-bold text-[#8b4f63]"}>{attempt.paymentStatus}</span></td><td className="py-3">{attempt.overallScore ?? "—"}{attempt.overallScore !== null ? "/100" : ""}</td><td className="py-3 text-xs">{attempt.reportEmailStatus ?? "pending"}</td><td className="py-3 text-xs text-[#657084]">{new Date(attempt.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div> : <p className="mt-5 border border-dashed border-[#16243d]/20 bg-white/60 p-5 text-sm text-[#657084]">No psychometric attempts match the current filters.</p>}</section>
        <section className="mt-10 border border-[#c9a34e]/45 bg-[#fffaf0] p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 border-b border-[#16243d]/10 pb-5 sm:flex-row sm:items-end"><div><p className="eyebrow text-[#a27e2e]">Weekly delivery</p><h2 className="display mt-2 text-2xl">Keep the signal moving.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">Email the branded psychometric analytics PDF to verified administrators every Monday at 09:00 UTC.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => enablePsychometricSchedule.mutate()} disabled={enablePsychometricSchedule.isPending || Boolean(psychometricSchedule.data?.config?.scheduleTaskUid)} className="inline-flex items-center gap-2 bg-[#16243d] px-4 py-3 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-50"><CalendarClock size={14} />{psychometricSchedule.data?.config?.scheduleTaskUid ? "Weekly delivery enabled" : enablePsychometricSchedule.isPending ? "Enabling…" : "Enable weekly delivery"}</button>{psychometricSchedule.data?.config?.scheduleTaskUid && <button type="button" onClick={() => setPsychometricSchedulePaused.mutate({ paused: !psychometricSchedule.data?.config?.pausedAt })} disabled={setPsychometricSchedulePaused.isPending} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-50">{psychometricSchedule.data?.config?.pausedAt ? <Play size={14} /> : <Pause size={14} />}{psychometricSchedule.data?.config?.pausedAt ? "Resume" : "Pause"}</button>}<button type="button" onClick={downloadPsychometricAcknowledgementAudit} disabled={exportPsychometricAcknowledgementAudit.isPending} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-50"><Download size={14} /> Audit CSV</button></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="border border-[#16243d]/10 bg-white/70 p-4"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#a27e2e]">Status</p><p className="mt-2 text-sm font-bold">{psychometricSchedule.data?.config?.pausedAt ? "Paused" : psychometricSchedule.data?.config?.scheduleTaskUid ? "Active" : "Not enabled"}</p></div><div className="border border-[#16243d]/10 bg-white/70 p-4"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#a27e2e]">Last run</p><p className="mt-2 text-sm font-bold">{psychometricSchedule.data?.config?.lastRunAt ? new Date(psychometricSchedule.data.config.lastRunAt).toLocaleString() : "No report yet"}</p></div><div className="border border-[#16243d]/10 bg-white/70 p-4"><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#a27e2e]">Saved reports</p><p className="mt-2 text-sm font-bold">{psychometricSchedule.data?.runs?.length ?? 0}</p></div></div><div className="mt-6 border-t border-[#16243d]/10 pt-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.1em] text-[#a27e2e]">Failure acknowledgement</p><p className="mt-1 text-xs text-[#657084]">Record which administrator has taken ownership of a failed delivery.</p></div><span className="text-xs font-bold text-red-800">{(failedPsychometricDeliveries.data ?? []).filter((item) => !item.deliveryAcknowledgedAt).length} open</span></div><div className="mt-4 space-y-2">{(failedPsychometricDeliveries.data ?? []).filter((item) => !item.deliveryAcknowledgedAt).map((failure) => <div key={failure.id} className="flex flex-col justify-between gap-3 border border-red-900/15 bg-red-50 p-3 sm:flex-row sm:items-center"><div><p className="text-sm font-bold">{failure.name} · {failure.testSlug}</p><p className="text-xs text-red-900/75">{failure.email} · {new Date(failure.createdAt).toLocaleString()}</p></div><button type="button" onClick={() => { const note = window.prompt("Add a short acknowledgement note for this delivery failure:", "Reviewed and routed for resend.")?.trim(); if (note) acknowledgePsychometricDelivery.mutate({ attemptId: failure.id, note }); }} disabled={acknowledgePsychometricDelivery.isPending} className="inline-flex items-center justify-center gap-2 border border-red-900/30 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-red-900 disabled:opacity-50"><UserCheck size={13} /> Acknowledge</button></div>)}{!(failedPsychometricDeliveries.data ?? []).some((item) => !item.deliveryAcknowledgedAt) && <p className="text-sm text-[#657084]">No open delivery failures require acknowledgement.</p>}</div></div></section>
        <section className="mt-6 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="eyebrow text-[#a27e2e]">Acknowledgement audit</p><h3 className="display mt-2 text-xl">Operational notes, preserved.</h3><p className="mt-1 text-xs text-[#657084]">Recent administrator actions on failed report deliveries.</p></div><button type="button" onClick={downloadPsychometricAcknowledgementAudit} disabled={exportPsychometricAcknowledgementAudit.isPending} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-50"><Download size={13} /> Export audit CSV</button></div><div className="mt-4 space-y-2">{(psychometricAcknowledgementAudit.data ?? []).slice(0, 8).map((entry) => <div key={entry.id} className="border border-[#16243d]/10 bg-[#fffaf0] p-3"><div className="flex flex-wrap justify-between gap-2 text-xs"><strong>{entry.actorName}</strong><span className="text-[#657084]">{new Date(entry.createdAt).toLocaleString()}</span></div><p className="mt-1 text-sm text-[#16243d]">{entry.note}</p><p className="mt-1 text-[10px] uppercase tracking-[.08em] text-[#657084]">Attempt #{entry.attemptId}</p></div>)}{!(psychometricAcknowledgementAudit.data?.length) && <p className="text-sm text-[#657084]">No acknowledgement actions have been recorded yet.</p>}</div></section>\n        <AdminInquiryPanel />
        <AdminTranslationSuggestionsPanel />
        {overview.data && (
          <>
            <section className="mt-10 grid gap-4 sm:grid-cols-3">
              <Metric
                icon={Users}
                label="Matching attempts"
                value={filteredSummary.total}
              />
              <Metric
                icon={CheckCircle2}
                label="Verified payments"
                value={filteredSummary.paid}
                accent
              />
              <Metric
                icon={Clock3}
                label="Awaiting payment"
                value={filteredSummary.pending}
              />
            </section>
            <section className="mt-10 border border-[#16243d]/15 bg-white/35 p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="eyebrow flex items-center gap-2 text-[#a27e2e]">
                    <BarChart3 size={13} /> Platform signals
                  </p>
                  <h2 className="display mt-3 text-3xl">
                    Momentum, at a glance.
                  </h2>
                  <p className="mt-2 text-sm text-[#657084]">
                    Tracked events across the assessment and enrollment
                    journeys.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <DateField
                    label="From"
                    value={analyticsFrom}
                    onChange={setAnalyticsFrom}
                  />
                  <DateField
                    label="To"
                    value={analyticsTo}
                    onChange={setAnalyticsTo}
                  />
                </div>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData}
                        margin={{ top: 8, right: 8, bottom: 8, left: -20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#16243d20"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10 }}
                          interval={0}
                          angle={-12}
                          textAnchor="end"
                          height={48}
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            border: "1px solid #c9a34e",
                            background: "#f7f3e8",
                            fontSize: 12,
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#c9a34e"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={weeklyTrendData}
                        margin={{ top: 8, right: 8, bottom: 8, left: -20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#16243d20"
                        />
                        <XAxis dataKey="week" tick={{ fontSize: 9 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            border: "1px solid #c9a34e",
                            background: "#f7f3e8",
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="assessment_started"
                          stroke="#16243d"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="payment_completed"
                          stroke="#c9a34e"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="report_downloaded"
                          stroke="#7c8da6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {analyticsData.map(item => (
                    <div
                      key={item.label}
                      className="border-t border-[#16243d]/20 bg-[#f7f3e8] p-4"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
                        {item.label}
                      </p>
                      <p className="display mt-3 text-3xl text-[#a27e2e]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section
              className="mt-6 border border-[#16243d]/15 bg-white/45 p-5 sm:p-6"
              aria-label="Certificate and report sharing analytics"
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow flex items-center gap-2 text-[#a27e2e]">
                    <Share2 size={13} /> Share observatory
                  </p>
                  <h2 className="display mt-3 text-3xl">Credential reach</h2>
                  <p className="mt-2 text-sm text-[#657084]">
                    Authenticated share events by platform across all users.
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-[.1em] text-[#657084]">
                  {(shareAnalytics.data ?? []).reduce(
                    (sum, item) => sum + item.count,
                    0
                  )}{" "}
                  total shares
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {(shareAnalytics.data ?? []).map(item => {
                  const max = Math.max(
                    ...(shareAnalytics.data ?? []).map(entry => entry.count),
                    1
                  );
                  return (
                    <div
                      key={item.platform}
                      className="border-t border-[#16243d]/20 bg-[#f7f3e8] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
                          {item.platform}
                        </p>
                        <span className="text-lg font-semibold text-[#a27e2e]">
                          {item.count}
                        </span>
                      </div>
                      <div className="mt-3 h-2 bg-[#16243d]/10">
                        <div
                          className="h-2 bg-[#c9a34e]"
                          style={{
                            width: `${Math.round((item.count / max) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {(shareAnalytics.data?.length ?? 0) === 0 && (
                <p className="mt-5 text-sm text-[#657084]">
                  No certificate or report shares have been recorded yet.
                </p>
              )}
            </section>
            <section className="mt-6 border border-[#16243d]/15 bg-[#16243d] p-5 text-[#f7f3e8]">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-[#c9a34e]" />
                <p className="eyebrow text-[#c9a34e]">Assessment funnel</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {funnelData.map((stage, index) => (
                  <div
                    key={stage.label}
                    className="border-l border-[#c9a34e]/60 pl-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#c1cad7]">
                      {stage.label}
                    </p>
                    <p className="display mt-2 text-3xl">{stage.value}</p>
                    <p className="mt-1 text-xs text-[#c1cad7]">
                      {index === 0
                        ? "entry volume"
                        : `${stage.rate}% current · ${stage.delta >= 0 ? "+" : ""}${stage.delta} pts vs prior`}
                    </p>
                    <p
                      className={`mt-2 text-[10px] uppercase tracking-[.1em] ${stage.rate >= stage.benchmark ? "text-[#c9a34e]" : "text-red-300"}`}
                    >
                      {stage.rate >= stage.benchmark
                        ? `Benchmark ${stage.benchmark}% · on track`
                        : `Below benchmark · ${stage.rate}% vs ${stage.benchmark}% target`}
                    </p>
                    {stage.rate < stage.benchmark && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[.1em] text-red-200">
                        <AlertCircle size={12} /> Attention needed
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#c9a34e]/30 pt-4 text-xs text-[#c1cad7]">
                <label>
                  Paid benchmark{" "}
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={paidBenchmark}
                    onChange={event =>
                      setPaidBenchmark(Number(event.target.value))
                    }
                    className="ml-2 w-16 bg-[#f7f3e8] px-2 py-1 text-[#16243d]"
                  />
                  %
                </label>
                <label>
                  Download benchmark{" "}
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={downloadBenchmark}
                    onChange={event =>
                      setDownloadBenchmark(Number(event.target.value))
                    }
                    className="ml-2 w-16 bg-[#f7f3e8] px-2 py-1 text-[#16243d]"
                  />
                  %
                </label>
                <button
                  type="button"
                  onClick={handleSaveBenchmarks}
                  disabled={saveAnalyticsSettings.isPending}
                  className="inline-flex items-center gap-2 border border-[#c9a34e] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-60"
                >
                  {saveAnalyticsSettings.isPending ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}{" "}
                  {saveAnalyticsSettings.isPending
                    ? "Saving…"
                    : "Save benchmarks"}
                </button>
                {saveAnalyticsSettings.isSuccess && (
                  <span className="text-emerald-300">Saved for this admin</span>
                )}
              </div>
            </section>
            <section className="mt-10 border border-[#16243d]/15 bg-[#16243d] p-5 text-[#f7f3e8] sm:p-7">
              <div className="flex flex-col justify-between gap-4 border-b border-[#c9a34e]/35 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="eyebrow text-[#c9a34e]">Security observatory</p>
                  <h2 className="display mt-3 text-3xl">
                    Login signals over time
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c1cad7]">
                    Access outcomes and session device mix, based on
                    privacy-safe security metadata. The selected date range and
                    granularity apply to both charts.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex border border-[#c9a34e]/60 p-1"
                    role="group"
                    aria-label="Chart granularity"
                  >
                    <button
                      type="button"
                      onClick={() => setLoginGranularity("daily")}
                      aria-pressed={loginGranularity === "daily"}
                      className={`px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] ${loginGranularity === "daily" ? "bg-[#c9a34e] text-[#101d35]" : "text-[#c1cad7]"}`}
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginGranularity("weekly")}
                      aria-pressed={loginGranularity === "weekly"}
                      className={`px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] ${loginGranularity === "weekly" ? "bg-[#c9a34e] text-[#101d35]" : "text-[#c1cad7]"}`}
                    >
                      Weekly
                    </button>
                  </div>
                  <ShieldCheck
                    className="hidden text-[#c9a34e] sm:block"
                    size={24}
                  />
                </div>
              </div>
              <div className="mt-6 grid gap-5 xl:grid-cols-2">
                <div className="border border-[#c1cad7]/15 bg-[#101d35]/70 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e]">
                        Access outcomes
                      </p>
                      <p className="mt-1 text-xs text-[#c1cad7]">
                        {loginGranularity === "daily" ? "Daily" : "Weekly"}{" "}
                        successful and blocked sign-ins
                      </p>
                    </div>
                    <div className="flex gap-3 text-[10px] font-black uppercase tracking-[.1em]">
                      <span className="text-[#c9a34e]">Success</span>
                      <span className="text-red-300">Blocked</span>
                    </div>
                  </div>
                  <div className="mt-5 h-64">
                    {loginSecurityAnalytics.isLoading ? (
                      <div className="grid h-full place-items-center text-sm text-[#c1cad7]">
                        Loading login trends…
                      </div>
                    ) : (loginSecurityAnalytics.data?.loginTrend.length ??
                        0) === 0 ? (
                      <div className="grid h-full place-items-center text-center text-sm text-[#c1cad7]">
                        No login events in this range.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={loginSecurityAnalytics.data?.loginTrend}
                        >
                          <CartesianGrid
                            stroke="#c1cad7"
                            strokeOpacity={0.12}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="week"
                            tickFormatter={value => value.slice(5)}
                            stroke="#c1cad7"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            stroke="#c1cad7"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#f7f3e8",
                              border: "1px solid #c9a34e",
                              color: "#16243d",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="success"
                            name="Success"
                            stroke="#c9a34e"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: "#c9a34e" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="failed"
                            name="Failed attempts"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#f59e0b" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="blocked"
                            name="Rate limited"
                            stroke="#fca5a5"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#fca5a5" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                <div className="border border-[#c1cad7]/15 bg-[#101d35]/70 p-4 sm:p-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e]">
                      Device classifications
                    </p>
                    <p className="mt-1 text-xs text-[#c1cad7]">
                      Session mix by{" "}
                      {loginGranularity === "daily" ? "day" : "week"}
                    </p>
                  </div>
                  <div className="mt-5 h-64">
                    {loginSecurityAnalytics.isLoading ? (
                      <div className="grid h-full place-items-center text-sm text-[#c1cad7]">
                        Loading device mix…
                      </div>
                    ) : (loginSecurityAnalytics.data?.deviceTrend.length ??
                        0) === 0 ? (
                      <div className="grid h-full place-items-center text-center text-sm text-[#c1cad7]">
                        No classified sessions in this range.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={loginSecurityAnalytics.data?.deviceTrend}
                        >
                          <CartesianGrid
                            stroke="#c1cad7"
                            strokeOpacity={0.12}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="week"
                            tickFormatter={value => value.slice(5)}
                            stroke="#c1cad7"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            stroke="#c1cad7"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#f7f3e8",
                              border: "1px solid #c9a34e",
                              color: "#16243d",
                            }}
                          />
                          <Bar
                            dataKey="desktop"
                            name="Desktop"
                            stackId="devices"
                            fill="#c9a34e"
                          />
                          <Bar
                            dataKey="mobile"
                            name="Mobile"
                            stackId="devices"
                            fill="#8aa0be"
                          />
                          <Bar
                            dataKey="tablet"
                            name="Tablet"
                            stackId="devices"
                            fill="#d9c28a"
                          />
                          <Bar
                            dataKey="unknown"
                            name="Unknown"
                            stackId="devices"
                            fill="#657084"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-[.1em] text-[#c1cad7]">
                    <span>
                      <i className="mr-1 inline-block h-2 w-2 bg-[#c9a34e]" />
                      Desktop
                    </span>
                    <span>
                      <i className="mr-1 inline-block h-2 w-2 bg-[#8aa0be]" />
                      Mobile
                    </span>
                    <span>
                      <i className="mr-1 inline-block h-2 w-2 bg-[#d9c28a]" />
                      Tablet
                    </span>
                    <span>
                      <i className="mr-1 inline-block h-2 w-2 bg-[#657084]" />
                      Unknown
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <section className="mt-10 border-y border-[#16243d]/15 bg-white/35 p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="eyebrow flex items-center gap-2 text-[#a27e2e]">
                    <Filter size={13} /> Refine the register
                  </p>
                  <p className="mt-2 text-sm text-[#657084]">
                    Filters apply to attempt date, payment state, and verified
                    overall score.
                  </p>
                </div>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 self-start text-[10px] font-black uppercase tracking-[.14em] text-[#a27e2e]"
                  >
                    <X size={14} /> Clear filters
                  </button>
                )}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="Payment status"
                  value={paymentFilter}
                  onChange={value => setPaymentFilter(value as PaymentFilter)}
                  options={[
                    ["all", "All statuses"],
                    ["paid", "Paid only"],
                    ["pending", "Pending only"],
                  ]}
                />
                <SelectField
                  label="Score band"
                  value={scoreFilter}
                  onChange={value => setScoreFilter(value as ScoreFilter)}
                  options={[
                    ["all", "All scores"],
                    ["high", "80–100 · Strong"],
                    ["mid", "60–79 · Building"],
                    ["developing", "0–59 · Developing"],
                    ["locked", "Locked / unpaid"],
                  ]}
                />
                <DateField
                  label="From date"
                  value={fromDate}
                  onChange={setFromDate}
                />
                <DateField
                  label="To date"
                  value={toDate}
                  onChange={setToDate}
                />
              </div>
            </section>
            <section className="mt-12">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow text-[#a27e2e]">Attempt register</p>
                  <h2 className="display mt-3 text-3xl">Recent participants</h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-[.12em] text-[#657084]">
                  Showing {filteredAttempts.length} of{" "}
                  {overview.data.attempts.length}
                </span>
              </div>
              {filteredAttempts.length === 0 ? (
                <div className="mt-6 border border-dashed border-[#16243d]/25 p-8 text-sm text-[#657084]">
                  No attempts match the current filters.
                </div>
              ) : (
                <div className="mt-6 overflow-hidden border border-[#16243d]/15 bg-white/45">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                      <thead className="bg-[#16243d] text-[#f7f3e8]">
                        <tr>
                          {[
                            "Participant",
                            "Attempt date",
                            "Payment",
                            "Score",
                            "Paystack reference",
                          ].map(heading => (
                            <th
                              key={heading}
                              className="px-5 py-4 text-[10px] font-black uppercase tracking-[.14em]"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttempts.map(attempt => (
                          <tr
                            key={attempt.id}
                            className="border-t border-[#16243d]/10"
                          >
                            <td className="px-5 py-5">
                              <p className="font-bold">{attempt.name}</p>
                              <p className="mt-1 text-xs text-[#657084]">
                                {attempt.email}
                              </p>
                            </td>
                            <td className="px-5 py-5 text-sm text-[#4a566a]">
                              {new Date(attempt.createdAt).toLocaleString()}
                            </td>
                            <td className="px-5 py-5">
                              <span
                                className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] ${attempt.paymentStatus === "paid" ? "text-emerald-800" : "text-[#a27e2e]"}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${attempt.paymentStatus === "paid" ? "bg-emerald-600" : "bg-[#c9a34e]"}`}
                                />
                                {statusLabel(attempt.paymentStatus)}
                              </span>
                            </td>
                            <td className="px-5 py-5">
                              {attempt.overallScore === null ? (
                                <span className="text-sm text-[#657084]">
                                  Locked
                                </span>
                              ) : (
                                <div>
                                  <span className="display text-2xl text-[#a27e2e]">
                                    {attempt.overallScore}
                                  </span>
                                  <span className="ml-2 text-xs text-[#657084]">
                                    {attempt.overallBand}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="max-w-[180px] truncate px-5 py-5 font-mono text-xs text-[#657084]">
                              {attempt.paystackReference ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
        <section className="mt-14 border border-[#16243d]/15 bg-white/45 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow flex items-center gap-2 text-[#a27e2e]">
                <UserCheck size={13} /> Identity controls
              </p>
              <h2 className="display mt-3 text-3xl">
                Email-verification eligibility.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">
                Review which accounts can receive scheduled admin alerts.
                Revoking an account removes its eligibility immediately; the
                account can become eligible again after its next trusted OAuth
                sign-in.
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-[.12em] text-[#657084]">
              {userVerificationReview.data?.total ?? 0} accounts
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <label className="relative">
              <Search
                size={13}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#657084]"
              />
              <span className="sr-only">Search users</span>
              <input
                value={verificationSearch}
                onChange={event =>
                  handleVerificationFilterChange(
                    setVerificationSearch,
                    event.target.value
                  )
                }
                placeholder="Search name, email, or ID"
                className="w-full border border-[#16243d]/20 bg-[#f7f3e8] py-2 pl-7 pr-2 text-xs text-[#16243d] outline-none focus:border-[#c9a34e]"
              />
            </label>
            <select
              value={verificationFilter}
              onChange={event => {
                setVerificationFilter(
                  event.target.value as "all" | "verified" | "unverified"
                );
                setVerificationPage(1);
              }}
              aria-label="Filter users by email verification"
              className="border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs font-semibold text-[#16243d]"
            >
              <option value="all">All eligibility</option>
              <option value="verified">Verified only</option>
              <option value="unverified">Unverified only</option>
            </select>
            <div className="flex items-center justify-end text-xs text-[#657084]">
              Page {userVerificationReview.data?.page ?? 1} of{" "}
              {userVerificationReview.data?.totalPages ?? 1}
            </div>
          </div>
          {(userVerificationReview.data?.rows.length ?? 0) === 0 ? (
            <div className="mt-4 border border-dashed border-[#16243d]/20 p-4 text-sm text-[#657084]">
              No users match this search and eligibility filter.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
              {userVerificationReview.data?.rows.map(account => (
                <div
                  key={account.openId}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-bold">
                      {account.name || "Unnamed account"}{" "}
                      <span className="ml-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
                        {account.role}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-[#657084]">
                      {account.email || "No email address"}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[.1em] text-[#657084]">
                      Last sign-in{" "}
                      {new Date(account.lastSignedIn).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] ${account.emailVerifiedAt ? "text-emerald-800" : "text-[#a27e2e]"}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${account.emailVerifiedAt ? "bg-emerald-600" : "bg-[#c9a34e]"}`}
                      />
                      {account.emailVerifiedAt
                        ? `Verified ${new Date(account.emailVerifiedAt).toLocaleDateString()}`
                        : "Not eligible"}
                    </span>
                    {account.emailVerifiedAt &&
                      account.openId !== user.openId && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRevokeVerification(
                              account.openId,
                              account.email
                            )
                          }
                          disabled={revokeUserEmailVerification.isPending}
                          className="inline-flex items-center gap-1 border border-red-800/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-red-800 disabled:opacity-50"
                        >
                          {revokeUserEmailVerification.isPending ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <X size={12} />
                          )}{" "}
                          Revoke
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {(userVerificationReview.data?.totalPages ?? 1) > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setVerificationPage(page => Math.max(1, page - 1))
                }
                disabled={verificationPage <= 1}
                className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
              >
                <ChevronLeft size={13} /> Previous
              </button>
              <span className="text-xs text-[#657084]">
                {userVerificationReview.data?.total ?? 0} results
              </span>
              <button
                type="button"
                onClick={() =>
                  setVerificationPage(page =>
                    Math.min(
                      userVerificationReview.data?.totalPages ?? 1,
                      page + 1
                    )
                  )
                }
                disabled={
                  verificationPage >=
                  (userVerificationReview.data?.totalPages ?? 1)
                }
                className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          )}
        </section>
        <section className="mt-10 border border-[#16243d]/15 bg-white/45 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-[#a27e2e]">Account history</p>
              <h2 className="display mt-3 text-3xl">
                Verification revocation audit.
              </h2>
              <p className="mt-2 text-sm text-[#657084]">
                Compliance-ready history of eligibility changes, with the acting
                administrator and recorded reason.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAuditExport}
              disabled={
                exportVerificationAudits.isFetching ||
                !(revocationAudits.data?.total ?? 0)
              }
              className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-50"
            >
              {exportVerificationAudits.isFetching ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Download size={12} />
              )}{" "}
              {exportVerificationAudits.isFetching
                ? "Preparing…"
                : "Export compliance CSV"}
            </button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <label className="relative">
              <Search
                size={13}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#657084]"
              />
              <span className="sr-only">Filter by administrator</span>
              <input
                value={auditAdminSearch}
                onChange={event => {
                  setAuditAdminSearch(event.target.value);
                  setAuditPage(1);
                }}
                placeholder="Filter by admin name, email, or ID"
                className="w-full border border-[#16243d]/20 bg-[#f7f3e8] py-2 pl-7 pr-2 text-xs text-[#16243d] outline-none focus:border-[#c9a34e]"
              />
            </label>
            <DateField
              label="From date"
              value={auditFromDate}
              onChange={value => {
                setAuditFromDate(value);
                setAuditPage(1);
              }}
            />
            <DateField
              label="To date"
              value={auditToDate}
              onChange={value => {
                setAuditToDate(value);
                setAuditPage(1);
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#657084]">
            <span>{revocationAudits.data?.total ?? 0} matching records</span>
            <span>
              Page {revocationAudits.data?.page ?? 1} of{" "}
              {revocationAudits.data?.totalPages ?? 1}
            </span>
          </div>
          {(revocationAudits.data?.rows.length ?? 0) === 0 ? (
            <p className="mt-4 border border-dashed border-[#16243d]/20 p-4 text-sm text-[#657084]">
              No verification revocations match these filters.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
              {revocationAudits.data?.rows.map(audit => (
                <div
                  key={audit.id}
                  className="grid gap-2 py-4 sm:grid-cols-[1fr_1.2fr_1fr]"
                >
                  <div>
                    <p className="text-xs font-bold">
                      {audit.targetEmail || audit.targetOpenId}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[.1em] text-red-800">
                      Revoked {new Date(audit.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#4a566a]">{audit.reason}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
                      By {audit.actorName || audit.actorOpenId}
                    </p>
                    <p className="mt-1 text-xs text-[#657084]">
                      {audit.actorEmail || "No actor email"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(revocationAudits.data?.totalPages ?? 1) > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setAuditPage(page => Math.max(1, page - 1))}
                disabled={auditPage <= 1}
                className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
              >
                <ChevronLeft size={13} /> Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setAuditPage(page =>
                    Math.min(revocationAudits.data?.totalPages ?? 1, page + 1)
                  )
                }
                disabled={auditPage >= (revocationAudits.data?.totalPages ?? 1)}
                className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          )}
        </section>
        <section className="mt-14 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow text-[#a27e2e]">Course interest</p>
            <h2 className="display mt-3 text-3xl">
              Export the enrollment register.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#657084]">
              Download a CSV of submitted course inquiries for legitimate
              follow-up. The export includes consent and submission timestamps.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <DateField
                label="From date"
                value={exportFrom}
                onChange={setExportFrom}
              />
              <DateField
                label="To date"
                value={exportTo}
                onChange={setExportTo}
              />
              <SelectField
                label="Enrollment status"
                value={exportStatus}
                onChange={setExportStatus}
                options={[
                  ["all", "All statuses"],
                  ["new", "New"],
                  ["contacted", "Contacted"],
                  ["enrolled", "Enrolled"],
                ]}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExport}
                disabled={exportEnrollments.isFetching}
                className="mt-6 inline-flex items-center gap-2 bg-[#16243d] px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] disabled:opacity-60"
              >
                {exportEnrollments.isFetching ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Download size={15} />
                )}{" "}
                {exportEnrollments.isFetching
                  ? "Preparing CSV…"
                  : "Download enrollments CSV"}
              </button>
              <button
                type="button"
                onClick={handleEnableWeeklyExport}
                disabled={
                  enableWeeklyExport.isPending || enableWeeklyExport.isSuccess
                }
                className="inline-flex items-center gap-2 border border-[#16243d]/25 px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] disabled:opacity-60"
              >
                {enableWeeklyExport.isPending ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <CalendarClock size={15} />
                )}{" "}
                {enableWeeklyExport.isSuccess
                  ? "Weekly export enabled"
                  : "Enable weekly export"}
              </button>
            </div>
            {enableWeeklyExport.isSuccess && (
              <p className="mt-3 text-xs font-semibold text-emerald-800">
                Runs Mondays at 09:00 UTC and stores the report securely.
              </p>
            )}
            <div className="border border-[#16243d]/15 bg-white/45 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="eyebrow flex items-center gap-2 text-[#a27e2e]">
                    <Mail size={13} /> Branded communications
                  </p>
                  <h2 className="display mt-3 text-3xl">
                    Email template editor.
                  </h2>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.13em] text-[#657084]">
                  Admin only
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#657084]">
                Prepare reusable copy for future report delivery and course
                follow-up. Supported fields:{" "}
                <code className="text-[#a27e2e]">{"{{name}}"}</code>,{" "}
                <code className="text-[#a27e2e]">{"{{email}}"}</code>,{" "}
                <code className="text-[#a27e2e]">{"{{date}}"}</code>, and{" "}
                <code className="text-[#a27e2e]">{"{{course}}"}</code>.
              </p>
              <div className="mt-6 grid gap-4">
                <SelectField
                  label="Template"
                  value={templateKey}
                  onChange={value => setTemplateKey(value as TemplateKey)}
                  options={[
                    ["assessment_report", "Assessment report delivery"],
                    ["course_enrollment", "Course enrollment follow-up"],
                  ]}
                />
                <label className="text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">
                  Label
                  <input
                    value={templateLabel}
                    onChange={event => setTemplateLabel(event.target.value)}
                    className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-semibold text-[#16243d] outline-none focus:border-[#c9a34e]"
                  />
                </label>
                <label className="text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">
                  Subject
                  <input
                    value={templateSubject}
                    onChange={event => setTemplateSubject(event.target.value)}
                    className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-semibold text-[#16243d] outline-none focus:border-[#c9a34e]"
                  />
                </label>
                <label className="text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">
                  Body
                  <div className="mt-2 flex flex-wrap gap-2 border border-b-0 border-[#16243d]/20 bg-[#ebe7dc] p-2">
                    <button
                      type="button"
                      onClick={() => applyFormat("**")}
                      title="Bold"
                      className="grid h-8 w-8 place-items-center border border-[#16243d]/15 hover:border-[#c9a34e]"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat("_")}
                      title="Italic"
                      className="grid h-8 w-8 place-items-center border border-[#16243d]/15 hover:border-[#c9a34e]"
                    >
                      <Italic size={14} />
                    </button>
                    {["name", "email", "date", "course"].map(token => (
                      <button
                        type="button"
                        key={token}
                        onClick={() => applyFormat(`{{${token}}}`, "")}
                        className="border border-[#16243d]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] hover:border-[#c9a34e]"
                      >{`{{${token}}}`}</button>
                    ))}
                  </div>
                  <textarea
                    ref={templateBodyRef}
                    rows={7}
                    value={templateBody}
                    onChange={event => setTemplateBody(event.target.value)}
                    className="mt-2 w-full resize-y border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm leading-6 text-[#16243d] outline-none focus:border-[#c9a34e]"
                  />
                </label>
              </div>
              <div className="border-l-2 border-[#c9a34e] bg-[#16243d] p-4 text-sm leading-6 text-[#c1cad7]">
                <p className="eyebrow text-[#c9a34e]">Live preview</p>
                <div className="prose prose-sm prose-invert mt-3 max-w-none">
                  <Streamdown>{previewBody}</Streamdown>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={saveTemplate.isPending}
                  className="inline-flex items-center gap-2 bg-[#c9a34e] px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#101d35] disabled:opacity-60"
                >
                  {saveTemplate.isPending ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}{" "}
                  {saveTemplate.isPending ? "Saving…" : "Save template"}
                </button>
                {templateSaved && (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 size={16} /> Saved
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={sendTemplateTest.isPending}
                  className="inline-flex items-center gap-2 border border-[#16243d]/25 px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] disabled:opacity-60"
                >
                  {sendTemplateTest.isPending ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}{" "}
                  {sendTemplateTest.isPending
                    ? "Sending preview…"
                    : "Send test email"}
                </button>
                {sendTemplateTest.isSuccess && (
                  <span className="text-sm font-semibold text-emerald-800">
                    Preview sent to your admin email.
                  </span>
                )}
              </div>
              <div className="mt-6 border-t border-[#16243d]/15 pt-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="eyebrow text-[#a27e2e]">Preview history</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="relative">
                      <Search
                        size={13}
                        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#657084]"
                      />
                      <span className="sr-only">Search delivery history</span>
                      <input
                        value={deliverySearch}
                        onChange={event =>
                          handleDeliveryFilterChange(
                            setDeliverySearch,
                            event.target.value
                          )
                        }
                        placeholder="Search recipient or subject"
                        className="w-full border border-[#16243d]/20 bg-[#f7f3e8] py-2 pl-7 pr-2 text-xs text-[#16243d] outline-none focus:border-[#c9a34e]"
                      />
                    </label>
                    <select
                      value={deliveryStatus}
                      onChange={event => {
                        setDeliveryStatus(
                          event.target.value as "all" | "sent" | "failed"
                        );
                        setDeliveryPage(1);
                      }}
                      aria-label="Filter delivery history by status"
                      className="border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs font-semibold text-[#16243d]"
                    >
                      <option value="all">All statuses</option>
                      <option value="sent">Sent</option>
                      <option value="failed">Failed</option>
                    </select>
                    <DateField
                      label="From"
                      value={deliveryFrom}
                      onChange={value =>
                        handleDeliveryFilterChange(setDeliveryFrom, value)
                      }
                    />
                    <DateField
                      label="To"
                      value={deliveryTo}
                      onChange={value =>
                        handleDeliveryFilterChange(setDeliveryTo, value)
                      }
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#657084]">
                      {emailPreviewHistory.data?.total ?? 0} matching delivery
                      attempts
                    </span>
                    <button
                      type="button"
                      onClick={handleDeliveryExport}
                      disabled={
                        queueDeliveryLogExport.isPending ||
                        !emailPreviewHistory.data?.total
                      }
                      className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#16243d] disabled:opacity-50"
                    >
                      {queueDeliveryLogExport.isPending ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Download size={12} />
                      )}{" "}
                      {queueDeliveryLogExport.isPending
                        ? "Queueing…"
                        : "Queue CSV export"}
                    </button>
                    <button
                      type="button"
                      onClick={() => enableDeliveryLogExportWorker.mutate()}
                      disabled={enableDeliveryLogExportWorker.isPending}
                      className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#16243d] disabled:opacity-50"
                    >
                      {enableDeliveryLogExportWorker.isPending ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <CalendarClock size={12} />
                      )}{" "}
                      Enable worker
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-[.1em] text-[#657084]">
                    Queued exports are processed in the background once per
                    minute after the worker is enabled.
                  </p>
                  {(deliveryLogExportJobs.data?.length ?? 0) > 0 && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {deliveryLogExportJobs.data?.slice(0, 4).map(job => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between gap-3 border border-[#16243d]/10 bg-white/50 px-3 py-2 text-xs"
                        >
                          <span>
                            <strong>Export #{job.id}</strong>
                            <span className="ml-2 uppercase tracking-[.1em] text-[#657084]">
                              {job.status}
                            </span>
                          </span>
                          {job.status === "completed" && job.fileUrl ? (
                            <a
                              href={job.fileUrl}
                              download
                              className="font-black uppercase tracking-[.1em] text-[#a27e2e]"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-[#657084]">
                              {job.rowCount ?? 0} rows
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {filteredPreviewHistory.length === 0 ? (
                  <div className="mt-4 border border-dashed border-[#16243d]/20 p-4 text-sm text-[#657084]">
                    No delivery attempts match this search and status filter.
                  </div>
                ) : (
                  <div className="mt-3 divide-y divide-[#16243d]/10">
                    {filteredPreviewHistory.map(delivery => (
                      <div
                        key={delivery.id}
                        className="flex flex-col justify-between gap-2 py-3 text-xs sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="font-bold">{delivery.subject}</p>
                          <p className="mt-1 text-[#657084]">
                            {delivery.recipientEmail} ·{" "}
                            {new Date(delivery.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`font-black uppercase tracking-[.12em] ${delivery.status === "sent" ? "text-emerald-800" : "text-red-700"}`}
                          >
                            {delivery.status}
                          </span>
                          {delivery.status === "failed" && (
                            <button
                              type="button"
                              onClick={() =>
                                retryTemplateTestEmail.mutate({
                                  deliveryId: delivery.id,
                                })
                              }
                              disabled={retryTemplateTestEmail.isPending}
                              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[.1em] text-[#a27e2e]"
                            >
                              {retryTemplateTestEmail.isPending ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <Send size={12} />
                              )}{" "}
                              Retry
                            </button>
                          )}
                        </div>
                        {delivery.status === "failed" &&
                          delivery.errorMessage && (
                            <p className="mt-2 max-w-xl text-xs text-red-700">
                              Provider: {delivery.errorMessage}
                            </p>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#16243d]/10 pt-4">
              <span className="text-xs text-[#657084]">
                Page {emailPreviewHistory.data?.page ?? 1} of{" "}
                {emailPreviewHistory.data?.totalPages ?? 1}
              </span>
              {(emailPreviewHistory.data?.totalPages ?? 1) > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryPage(page => Math.max(1, page - 1))
                    }
                    disabled={deliveryPage <= 1}
                    className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
                  >
                    <ChevronLeft size={13} /> Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryPage(page =>
                        Math.min(
                          emailPreviewHistory.data?.totalPages ?? 1,
                          page + 1
                        )
                      )
                    }
                    disabled={
                      deliveryPage >=
                      (emailPreviewHistory.data?.totalPages ?? 1)
                    }
                    className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="mt-10 border border-[#16243d]/15 bg-white/45 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="eyebrow flex items-center gap-2 text-[#a27e2e]">
                <CalendarClock size={13} /> Export schedule
              </p>
              <h2 className="display mt-3 text-3xl">Weekly report status.</h2>
              <p className="mt-2 text-sm text-[#657084]">
                Securely generated enrollment reports remain available here for
                admin download.
              </p>
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-[.13em] ${scheduleStatus.data?.config?.scheduleTaskUid ? "text-emerald-800" : "text-[#a27e2e]"}`}
            >
              {scheduleStatus.data?.config?.scheduleTaskUid
                ? "Enabled"
                : "Not enabled"}
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                Last run
              </p>
              <p className="mt-2 text-sm font-bold">
                {scheduleStatus.data?.config?.lastRunAt
                  ? new Date(
                      scheduleStatus.data.config.lastRunAt
                    ).toLocaleString()
                  : "No report yet"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                Reports saved
              </p>
              <p className="mt-2 text-2xl font-bold text-[#a27e2e]">
                {scheduleStatus.data?.runs.length ?? 0}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                Latest rows
              </p>
              <p className="mt-2 text-2xl font-bold text-[#a27e2e]">
                {scheduleStatus.data?.runs[0]?.rowCount ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#16243d]/10 pt-5">
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              Retention days
              <input
                type="number"
                min="30"
                max="365"
                value={retentionDays}
                onChange={event => setRetentionDays(Number(event.target.value))}
                className="ml-2 w-20 border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-sm font-bold text-[#16243d]"
              />
            </label>
            <button
              type="button"
              onClick={() => handleRetentionSave(retentionDays)}
              disabled={updateExportRetention.isPending}
              className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#16243d] disabled:opacity-60"
            >
              {updateExportRetention.isPending ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              Save policy
            </button>
            <span className="text-xs text-[#657084]">
              Reports older than this are unlinked from admin history; the
              storage layer does not expose an object-delete endpoint.
            </span>
          </div>
          {(scheduleStatus.data?.runs.length ?? 0) > 0 && (
            <div className="mt-6 divide-y divide-[#16243d]/10 border-t border-[#16243d]/10">
              {scheduleStatus.data?.runs.map(run => (
                <div
                  key={run.id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-sm font-bold">
                      Week ending {new Date(run.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-xs text-[#657084]">
                      {run.rowCount} enrollment rows
                    </p>
                  </div>
                  <a
                    href={run.fileUrl}
                    download
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.13em] text-[#a27e2e] hover:text-[#16243d]"
                  >
                    <Download size={14} /> Download CSV
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mt-8 border border-[#16243d]/15 bg-white/45 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#16243d]/15 pb-5 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="mt-0.5 text-[#a27e2e]" />
              <div>
                <p className="eyebrow text-[#a27e2e]">Security observatory</p>
                <h2 className="display mt-2 text-2xl">Failed-login activity</h2>
                <p className="mt-1 text-sm text-[#657084]">
                  Review recent failed attempts and control when verified admins
                  receive alerts.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                Events in view
              </p>
              <p className="mt-1 text-2xl font-bold text-[#a27e2e]">
                {failedLoginEvents.data?.total ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-5 border border-[#a27e2e]/30 bg-[#f7f3e8] p-4">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a27e2e]">SMTP fallback</p>
            <p className="mt-1 text-xs leading-5 text-[#657084]">Generate a single-use reset link for an administrator when SMTP delivery is unavailable. The link expires in 10 minutes.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input type="email" value={adminResetEmail || user?.email || ""} onChange={event => setAdminResetEmail(event.target.value)} placeholder="Administrator email" className="min-w-0 flex-1 border border-[#16243d]/20 bg-white px-3 py-2 text-sm text-[#16243d]" /><button type="button" disabled={generateAdminResetLink.isPending} onClick={() => generateAdminResetLink.mutate({ email: adminResetEmail || user?.email || "", origin: window.location.origin })} className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8] disabled:opacity-60">{generateAdminResetLink.isPending && <RefreshCw size={12} className="animate-spin" />} Generate one-time link</button></div>
            {adminResetLink && <div className="mt-3 border-l-2 border-[#a27e2e] bg-white p-3 text-xs text-[#16243d]"><div className="break-all"><strong>One-time link:</strong> {adminResetLink}</div><div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" disabled={adminResetRemaining === 0} onClick={() => { void navigator.clipboard.writeText(adminResetLink).then(() => { setAdminResetCopied(true); toast.success("Reset link copied"); }); }} className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40">{adminResetCopied ? "Copied" : "Copy to clipboard"}</button><button type="button" disabled={revokeAdminResetLink.isPending} onClick={() => setConfirmResetRevocation(true)} className="border border-red-800/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-red-800 disabled:opacity-40">Revoke link</button><span className="text-[11px] text-[#657084]">{adminResetRemaining > 0 ? `Expires in ${Math.floor(adminResetRemaining / 60)}:${String(adminResetRemaining % 60).padStart(2, "0")}` : "Expired — generate a new link."}</span></div></div>}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              IP address
              <input
                type="search"
                value={securityIpSearch}
                onChange={event => {
                  setSecurityIpSearch(event.target.value);
                  setSecurityPage(1);
                }}
                placeholder="Search network address"
                className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
              />
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              Geographic location
              <input
                type="search"
                value={securityLocationSearch}
                onChange={event => {
                  setSecurityLocationSearch(event.target.value);
                  setSecurityPage(1);
                }}
                placeholder="Country code, e.g. KE"
                className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
              />
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              From
              <input
                type="date"
                value={securityFromDate}
                onChange={event => {
                  setSecurityFromDate(event.target.value);
                  setSecurityPage(1);
                }}
                className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
              />
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              To
              <input
                type="date"
                value={securityToDate}
                onChange={event => {
                  setSecurityToDate(event.target.value);
                  setSecurityPage(1);
                }}
                className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setSecurityFromDate("");
                setSecurityToDate("");
                setSecurityIpSearch("");
                setSecurityLocationSearch("");
                setSecurityPage(1);
              }}
              className="self-end border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em]"
            >
              Clear filters
            </button>
          </div>
          <div className="mt-5 grid gap-4 border-t border-[#16243d]/10 pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              Alert after failed attempts
              <input
                type="number"
                min="3"
                max="20"
                value={alertThreshold}
                onChange={event =>
                  setAlertThreshold(Number(event.target.value))
                }
                className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-bold normal-case tracking-normal text-[#16243d]"
              />
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              Review window (days)
              <input
                type="number"
                min="1"
                max="90"
                value={reviewWindowDays}
                onChange={event =>
                  setReviewWindowDays(Number(event.target.value))
                }
                className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-bold normal-case tracking-normal text-[#16243d]"
              />
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              Lockout duration (seconds)
              <input
                type="number"
                min="60"
                max="86400"
                value={lockoutWindowSeconds}
                onChange={event => setLockoutWindowSeconds(Number(event.target.value))}
                className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-bold normal-case tracking-normal text-[#16243d]"
              />
              <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-[#657084]">Allowed range: 1 minute to 24 hours.</span>
            </label>
            <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              Log retention (days)
              <input
                type="number"
                min="30"
                max="365"
                value={loginEventRetentionDays}
                onChange={event =>
                  setLoginEventRetentionDays(Number(event.target.value))
                }
                className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-bold normal-case tracking-normal text-[#16243d]"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                saveSecuritySettings.mutate({
                  alertThreshold,
                  reviewWindowDays,
                  loginEventRetentionDays,
                  lockoutWindowSeconds,
                })
              }
              disabled={saveSecuritySettings.isPending}
              className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-4 py-2.5 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8] disabled:opacity-60"
            >
              {saveSecuritySettings.isPending && (
                <RefreshCw size={13} className="animate-spin" />
              )}{" "}
              Save settings
            </button>
            <button
              type="button"
              onClick={handleExportSecurityLogs}
              disabled={exportSecurityLogs.isFetching}
              className="inline-flex items-center justify-center gap-2 border border-[#16243d]/20 px-4 py-2.5 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] disabled:opacity-60"
            >
              {exportSecurityLogs.isFetching && (
                <RefreshCw size={13} className="animate-spin" />
              )}{" "}
              Export security CSV
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#657084]">
            Failed-login events older than {loginEventRetentionDays} days are
            removed when this panel is viewed. The export includes the current
            filtered window within that retention period.
          </p>
          {exportSecurityLogs.data && (
            <p className="mt-2 text-xs font-semibold text-emerald-800">
              Security CSV ready: {exportSecurityLogs.data.retentionDays}-day
              retention applied.
            </p>
          )}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="border border-[#16243d]/10 bg-[#16243d] p-5 text-[#f7f3e8]">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e]">Regional threat signal</p>
              <p className="mt-1 text-xs text-[#c1cad7]">Failed-login events grouped by estimated region.</p>
              <div className="mt-4 h-52">
                {(failedLoginRegions.data?.length ?? 0) === 0 ? <div className="grid h-full place-items-center text-sm text-[#c1cad7]">No regional events in this range.</div> : <ResponsiveContainer width="100%" height="100%"><BarChart data={failedLoginRegions.data?.slice(0, 8)} layout="vertical" margin={{ left: 8, right: 12 }}><CartesianGrid stroke="#c1cad7" strokeOpacity={0.12} horizontal={false} /><XAxis type="number" allowDecimals={false} stroke="#c1cad7" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="location" width={58} stroke="#c1cad7" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: "#f7f3e8", border: "0", color: "#16243d" }} /><Bar dataKey="count" name="Failed attempts" fill="#c9a34e" radius={[0, 2, 2, 0]} /></BarChart></ResponsiveContainer>}
              </div>
            </div>
            <div className="border border-[#16243d]/10 bg-white/60 p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a27e2e]">Unlock audit history</p><p className="mt-1 text-xs text-[#657084]">Manual unlock actions recorded with actor and cleared attempts.</p></div><div className="grid gap-2 sm:grid-cols-3"><input type="search" value={unlockAuditSearch} onChange={event => { setUnlockAuditSearch(event.target.value); setUnlockAuditPage(1); }} placeholder="Search user or admin" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs text-[#16243d]" /><input type="date" value={unlockAuditFrom} onChange={event => { setUnlockAuditFrom(event.target.value); setUnlockAuditPage(1); }} className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs text-[#16243d]" /><input type="date" value={unlockAuditTo} onChange={event => { setUnlockAuditTo(event.target.value); setUnlockAuditPage(1); }} className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs text-[#16243d]" /></div><button type="button" disabled={exportUnlockAudits.isFetching} onClick={() => void exportUnlockAudits.refetch()} className="mt-3 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#16243d] disabled:opacity-50">Export filtered CSV</button></div>
              <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead><tr className="border-b border-[#16243d]/10 text-[9px] font-black uppercase tracking-[.12em] text-[#657084]"><th className="py-2 pr-3">When</th><th className="py-2 pr-3">Account</th><th className="py-2 pr-3">Admin</th><th className="py-2">Cleared</th></tr></thead><tbody>{unlockAuditHistory.data?.rows.map(audit => <tr key={audit.id} className="border-b border-[#16243d]/10"><td className="py-2 pr-3">{new Date(audit.createdAt).toLocaleString()}</td><td className="py-2 pr-3">{audit.targetEmail ?? audit.targetOpenId}</td><td className="py-2 pr-3">{audit.actorName ?? audit.actorOpenId}</td><td className="py-2">{audit.clearedAttemptCount}</td></tr>)}</tbody></table>{!(unlockAuditHistory.data?.rows.length) && <p className="py-5 text-sm text-[#657084]">No unlock actions recorded.</p>}</div>
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[.1em] text-[#657084]"><span>Page {unlockAuditHistory.data?.page ?? 1} of {unlockAuditHistory.data?.pageCount ?? 1}</span><div className="flex gap-2"><button type="button" disabled={unlockAuditPage <= 1} onClick={() => setUnlockAuditPage(page => page - 1)} className="border border-[#16243d]/20 px-2 py-1 disabled:opacity-40">Previous</button><button type="button" disabled={unlockAuditPage >= (unlockAuditHistory.data?.pageCount ?? 1)} onClick={() => setUnlockAuditPage(page => page + 1)} className="border border-[#16243d]/20 px-2 py-1 disabled:opacity-40">Next</button></div></div>
              <div className="mt-6 border-t border-[#16243d]/10 pt-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">CSV download history</p><p className="mt-1 text-xs text-[#657084]">Track which administrators downloaded unlock-audit records.</p></div><button type="button" disabled={exportUnlockAuditHistory.isFetching} onClick={async () => { const result = await exportUnlockAuditHistory.refetch(); if (!result.data) return; const anchor = document.createElement("a"); anchor.href = `data:${result.data.contentType},${encodeURIComponent(result.data.data)}`; anchor.download = result.data.filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); toast.success("Export history downloaded"); }} className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-50">{exportUnlockAuditHistory.isFetching ? "Preparing…" : "Download history CSV"}</button></div></div><div className="grid gap-2 sm:grid-cols-3"><input type="search" value={exportHistorySearch} onChange={event => { setExportHistorySearch(event.target.value); setExportHistoryPage(1); }} placeholder="Search administrator or file" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs" /><input type="date" value={exportHistoryFrom} onChange={event => { setExportHistoryFrom(event.target.value); setExportHistoryPage(1); }} aria-label="Export history start date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs" /><input type="date" value={exportHistoryTo} onChange={event => { setExportHistoryTo(event.target.value); setExportHistoryPage(1); }} aria-label="Export history end date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs" /></div></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><thead><tr className="border-b border-[#16243d]/10 text-[9px] font-black uppercase tracking-[.12em] text-[#657084]"><th className="py-2 pr-3">Downloaded</th><th className="py-2 pr-3">Administrator</th><th className="py-2 pr-3">File</th><th className="py-2">Filters</th></tr></thead><tbody>{unlockAuditExportHistory.data?.rows.map(download => <tr key={download.id} className="border-b border-[#16243d]/10"><td className="py-2 pr-3">{new Date(download.createdAt).toLocaleString()}</td><td className="py-2 pr-3">{download.adminName ?? download.adminOpenId}</td><td className="py-2 pr-3">{download.filename}</td><td className="max-w-[220px] truncate py-2">{download.filterSummary ?? "None"}</td></tr>)}</tbody></table>{!(unlockAuditExportHistory.data?.rows.length) && <p className="py-4 text-sm text-[#657084]">No CSV downloads match the current filters.</p>}</div><div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[.1em] text-[#657084]"><span>Page {unlockAuditExportHistory.data?.page ?? 1} of {unlockAuditExportHistory.data?.pageCount ?? 1}</span><div className="flex gap-2"><button type="button" disabled={exportHistoryPage <= 1} onClick={() => setExportHistoryPage(page => page - 1)} className="border border-[#16243d]/20 px-2 py-1 disabled:opacity-40">Previous</button><button type="button" disabled={exportHistoryPage >= (unlockAuditExportHistory.data?.pageCount ?? 1)} onClick={() => setExportHistoryPage(page => page + 1)} className="border border-[#16243d]/20 px-2 py-1 disabled:opacity-40">Next</button></div></div></div>
            </div>
          </div>
          <div className="mt-6 border-t border-[#16243d]/10 pt-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">Reset-link revocation audit</p><p className="mt-1 text-xs text-[#657084]">Every manual invalidation is recorded with the target account, acting administrator, and UTC event time.</p></div><button type="button" disabled={exportResetLinkRevocations.isFetching} onClick={async () => { const result = await exportResetLinkRevocations.refetch(); if (!result.data) return; const anchor = document.createElement("a"); anchor.href = `data:${result.data.contentType},${encodeURIComponent(result.data.data)}`; anchor.download = result.data.filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); toast.success("Revocation audit downloaded"); }} className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-50">Export revocations CSV</button></div><div className="mt-3 grid gap-2 sm:grid-cols-3"><input type="search" value={revocationAuditSearch} onChange={event => { setRevocationAuditSearch(event.target.value); setRevocationAuditPage(1); }} placeholder="Search account or admin" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs" /><input type="search" value={revocationAuditActor} onChange={event => { setRevocationAuditActor(event.target.value); setRevocationAuditPage(1); }} placeholder="Filter by administrator" aria-label="Filter revocations by administrator" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs" /><input type="date" value={revocationAuditFrom} onChange={event => { setRevocationAuditFrom(event.target.value); setRevocationAuditPage(1); }} aria-label="Revocation audit start date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs" /><input type="date" value={revocationAuditTo} onChange={event => { setRevocationAuditTo(event.target.value); setRevocationAuditPage(1); }} aria-label="Revocation audit end date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs" /></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="border-b border-[#16243d]/10 text-[9px] font-black uppercase tracking-[.12em] text-[#657084]"><th className="py-2 pr-3">Revoked at</th><th className="py-2 pr-3">Target account</th><th className="py-2">Administrator</th></tr></thead><tbody>{resetLinkRevocationHistory.data?.rows.map(event => <tr key={event.id} className="border-b border-[#16243d]/10"><td className="py-2 pr-3">{new Date(event.revokedAt).toLocaleString()}</td><td className="py-2 pr-3">{event.targetEmail}</td><td className="py-2">{event.actorName ?? event.actorOpenId}</td></tr>)}</tbody></table>{!(resetLinkRevocationHistory.data?.rows.length) && <p className="py-4 text-sm text-[#657084]">No reset-link revocations match the current filters.</p>}</div><div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[.1em] text-[#657084]"><span>Page {resetLinkRevocationHistory.data?.page ?? 1} of {resetLinkRevocationHistory.data?.pageCount ?? 1}</span><div className="flex gap-2"><button type="button" disabled={revocationAuditPage <= 1} onClick={() => setRevocationAuditPage(page => page - 1)} className="border border-[#16243d]/20 px-2 py-1 disabled:opacity-40">Previous</button><button type="button" disabled={revocationAuditPage >= (resetLinkRevocationHistory.data?.pageCount ?? 1)} onClick={() => setRevocationAuditPage(page => page + 1)} className="border border-[#16243d]/20 px-2 py-1 disabled:opacity-40">Next</button></div></div></div>
          {failedLoginEvents.data?.rows.length ? (
            <div className="mt-5 overflow-x-auto border-t border-[#16243d]/10">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#16243d]/10 text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                    <th className="py-3 pr-4">When</th>
                    <th className="py-3 pr-4">Identifier type</th>
                    <th className="py-3 pr-4">Reason</th>
                    <th className="py-3 pr-4">Network / location</th>
                    <th className="py-3">Device / action</th>
                  </tr>
                </thead>
                <tbody>
                  {failedLoginEvents.data.rows.map(event => (
                    <tr key={event.id} className="border-b border-[#16243d]/10">
                      <td className="py-3 pr-4">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">{event.identifierType}</td>
                      <td className="py-3 pr-4">
                        {event.failureCode?.replaceAll("_", " ")}
                      </td>
                      <td className="py-3 pr-4 text-xs text-[#657084]">
                        <span className="block">{event.networkAddress ?? "Unknown network"}</span>
                        <span className="block text-[10px] uppercase tracking-[.08em]">{event.estimatedLocation ?? "Location unavailable"}</span>
                      </td>
                      <td className="max-w-[260px] py-3 text-xs text-[#657084]">
                        <span className="block truncate">{event.userAgent ?? "Unknown device"}</span>
                        {event.openId && (
                          <button
                            type="button"
                            onClick={() => unlockUserLogin.mutate({ targetOpenId: event.openId! })}
                            disabled={unlockUserLogin.isPending}
                            className="mt-2 inline-flex items-center gap-1 border border-[#16243d]/20 px-2 py-1 text-[9px] font-black uppercase tracking-[.1em] text-[#16243d] disabled:opacity-50"
                          >
                            {unlockUserLogin.isPending && <RefreshCw size={10} className="animate-spin" />}
                            Unlock account
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 border-t border-[#16243d]/10 pt-5 text-sm text-[#657084]">
              No failed-login events match these filters.
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#16243d]/10 pt-4 text-xs text-[#657084]">
            <span>
              Page {failedLoginEvents.data?.page ?? securityPage} of{" "}
              {failedLoginEvents.data?.pageCount ?? 1}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={securityPage <= 1}
                onClick={() => setSecurityPage(page => Math.max(1, page - 1))}
                className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  securityPage >= (failedLoginEvents.data?.pageCount ?? 1)
                }
                onClick={() => setSecurityPage(page => page + 1)}
                className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
        {confirmResetRevocation && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-[#101d35]/75 p-4" role="dialog" aria-modal="true" aria-labelledby="reset-revoke-title">
            <div className="w-full max-w-md border-t-2 border-red-800 bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-8">
              <p className="eyebrow text-red-800">Security confirmation</p>
              <h2 id="reset-revoke-title" className="display mt-3 text-3xl">Revoke this reset link?</h2>
              <p className="mt-4 text-sm leading-6 text-[#4a566a]">The one-time administrator password-reset link will stop working immediately. This cannot be undone.</p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setConfirmResetRevocation(false)} className="border border-[#16243d]/20 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]">Keep link</button><button type="button" disabled={revokeAdminResetLink.isPending} onClick={() => { setConfirmResetRevocation(false); revokeAdminResetLink.mutate({ email: adminResetEmail || user?.email || "" }); }} className="bg-red-800 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8] disabled:opacity-60">{revokeAdminResetLink.isPending ? "Revoking…" : "Revoke link"}</button></div>
            </div>
          </div>
        )}
        {revokeTarget && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-[#101d35]/75 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="revoke-dialog-title"
          >
            <div className="w-full max-w-lg border-t-2 border-[#c9a34e] bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-[#a27e2e]">Verification control</p>
                  <h2
                    id="revoke-dialog-title"
                    className="display mt-3 text-3xl"
                  >
                    Revoke eligibility?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setRevokeTarget(null)}
                  aria-label="Close revoke dialog"
                  className="grid h-9 w-9 place-items-center border border-[#16243d]/20"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#657084]">
                This will stop{" "}
                <strong className="text-[#16243d]">
                  {revokeTarget.email || revokeTarget.openId}
                </strong>{" "}
                from receiving scheduled admin alerts. Record a reason for the
                audit trail.
              </p>
              <label className="mt-6 block text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">
                Reason
                <textarea
                  autoFocus
                  rows={4}
                  value={revokeReason}
                  onChange={event => setRevokeReason(event.target.value)}
                  placeholder="Example: mailbox ownership could not be confirmed"
                  className="mt-2 w-full resize-y border border-[#16243d]/20 bg-white px-3 py-3 text-sm normal-case leading-6 text-[#16243d] outline-none focus:border-[#c9a34e]"
                />
              </label>
              <p className="mt-2 text-xs text-[#657084]">
                Minimum 5 characters. This reason is visible to administrators
                in the audit log.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setRevokeTarget(null)}
                  className="border border-[#16243d]/20 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    revokeUserEmailVerification.mutate({
                      openId: revokeTarget.openId,
                      reason: revokeReason.trim(),
                    })
                  }
                  disabled={
                    revokeReason.trim().length < 5 ||
                    revokeUserEmailVerification.isPending
                  }
                  className="inline-flex items-center justify-center gap-2 bg-red-800 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-white disabled:opacity-40"
                >
                  {revokeUserEmailVerification.isPending && (
                    <RefreshCw size={13} className="animate-spin" />
                  )}{" "}
                  Confirm revoke
                </button>
              </div>
            </div>
          </div>
        )}
        <OrganizationApprovalQueue />
        <div className="mt-10 flex items-start gap-3 border-l-2 border-[#c9a34e] bg-[#16243d] p-5 text-sm leading-6 text-[#c1cad7]">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#c9a34e]" />
          <p>
            <strong className="text-[#f7f3e8]">Privacy boundary.</strong> This
            workspace excludes raw assessment answers and full reports. Use
            participant and enrollment contact details only for legitimate
            follow-up.
          </p>
        </div>
      </main>
    </div>
  );
}
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">
      {label}
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-semibold text-[#16243d] outline-none focus:border-[#c9a34e]"
      >
        {options.map(([option, text]) => (
          <option key={option} value={option}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">
      {label}
      <input
        type="date"
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-[11px] text-sm font-semibold text-[#16243d] outline-none focus:border-[#c9a34e]"
      />
    </label>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Users;
  label: string;
value: number | string;
   accent?: boolean;
}) {
  return (
    <div
      className={`border-t-2 ${accent ? "border-[#c9a34e]" : "border-[#16243d]/30"} bg-white/45 p-5`}
    >
      <Icon
        size={18}
        className={accent ? "text-[#a27e2e]" : "text-[#657084]"}
      />
      <p className="mt-6 text-xs font-black uppercase tracking-[.14em] text-[#657084]">
        {label}
      </p>
      <p className="display mt-2 text-4xl">{value}</p>
    </div>
  );
}
function AccessState({ title, message }: { title: string; message: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f3e8] px-6 text-[#16243d]">
      <div className="max-w-md border-t-2 border-[#c9a34e] bg-white/50 p-8 text-center">
        <LockKeyhole className="mx-auto text-[#a27e2e]" />
        <h1 className="display mt-5 text-4xl">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-[#657084]">{message}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => startLogin()}
            className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-5 py-4 text-[11px] font-black uppercase tracking-[.15em] text-[#f7f3e8]"
          >
            Sign in <span aria-hidden="true">→</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-5 py-4 text-[11px] font-black uppercase tracking-[.15em]"
          >
            Return to site <ArrowLeft size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}


function OrganizationApprovalQueue() {
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [historyPage, setHistoryPage] = useState(1);
  const query = trpc.admin.organizationInvitations.useQuery({ status, search: search || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined });
  const history = trpc.admin.organizationApprovalHistory.useQuery({ page: historyPage, pageSize: 10, search: search || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined });
  const exportHistory = trpc.admin.exportOrganizationApprovalHistory.useQuery({ search: search || undefined, fromDate: fromDate || undefined, toDate: toDate || undefined }, { enabled: false });
  const review = trpc.admin.reviewOrganizationInvitation.useMutation({ onSuccess: () => { query.refetch(); history.refetch(); } });
  const remind = trpc.admin.remindOrganizationInvitation.useMutation({ onSuccess: () => { query.refetch(); } });
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const downloadCsv = async () => { const result = await exportHistory.refetch(); if (!result.data) return; const anchor = document.createElement("a"); anchor.href = `data:${result.data.contentType};charset=utf-8,${encodeURIComponent(result.data.data)}`; anchor.download = result.data.filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); };
  const countdown = (value: Date | string) => { const remaining = new Date(value).getTime() - now; if (remaining <= 0) return "Expired"; const totalMinutes = Math.floor(remaining / 60000); const days = Math.floor(totalMinutes / 1440); const hours = Math.floor((totalMinutes % 1440) / 60); const minutes = totalMinutes % 60; return days ? `${days}d ${hours}h left` : `${hours}h ${minutes}m left`; };
  const trendCounts = (history.data?.trends ?? []).reduce((acc, item) => { acc[item.eventType] = (acc[item.eventType] ?? 0) + item.count; return acc; }, {} as Record<string, number>);
  const trendByDay = Object.entries((history.data?.trends ?? []).reduce((acc, item) => { acc[item.bucket] = (acc[item.bucket] ?? 0) + item.count; return acc; }, {} as Record<string, number>)).slice(-30);
  const maxTrend = Math.max(1, ...trendByDay.map(([, count]) => count));
  const chartPoints = trendByDay.map(([, count], index) => `${trendByDay.length === 1 ? 50 : (index / (trendByDay.length - 1)) * 100},${100 - (count / maxTrend) * 82}`).join(" ");
  return <section className="mt-14 border border-[#16243d]/15 bg-white/45 p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow text-[#a27e2e]">Organization review queue</p><h2 className="display mt-3 text-3xl">Approve with confidence.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">Monitor forwarded report requests, respond before invitations expire, and export a filtered compliance history.</p></div><button type="button" onClick={downloadCsv} disabled={exportHistory.isFetching} className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]"><Download size={14} /> {exportHistory.isFetching ? "Preparing…" : "Export history"}</button></div><div className="mt-6 grid gap-3 md:grid-cols-4"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search organization or email" aria-label="Search organization approvals" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm outline-none focus:border-[#c9a34e]" /><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Filter organization approvals by status" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} aria-label="Approval history start date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm" /><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} aria-label="Approval history end date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm" /></div><div className="mt-6 border border-[#16243d]/10 bg-[#f7f3e8] p-4"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">Approval trend · last 30 days</p><span className="text-[10px] text-[#657084]">{trendByDay.length} active days</span></div><div className="mt-4 h-28 w-full"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label="Organization approval events over the selected period"><path d="M0 100 H100" stroke="currentColor" strokeOpacity=".15" vectorEffect="non-scaling-stroke" /><polyline points={chartPoints || "0,100 100,100"} fill="none" stroke="#a27e2e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg></div><div className="mt-2 flex justify-between text-[10px] text-[#657084]"><span>{trendByDay[0]?.[0] ?? "No events yet"}</span><span>{trendByDay.at(-1)?.[0] ?? ""}</span></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="border-t-2 border-[#c9a34e] bg-white/55 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">Approval events</p><p className="mt-2 text-2xl font-bold">{history.data?.total ?? 0}</p></div><div className="border-t-2 border-emerald-700 bg-white/55 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">Approved</p><p className="mt-2 text-2xl font-bold text-emerald-800">{trendCounts.approved ?? 0}</p></div><div className="border-t-2 border-red-700 bg-white/55 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">Rejected</p><p className="mt-2 text-2xl font-bold text-red-800">{trendCounts.rejected ?? 0}</p></div></div><div className="mt-6 grid gap-3">{query.data?.map((invitation) => { const remaining = new Date(invitation.expiresAt).getTime() - now; const urgent = invitation.status === "pending" && remaining > 0 && remaining < 48 * 60 * 60 * 1000; return <article key={invitation.id} className="border border-[#16243d]/12 bg-[#f7f3e8] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold">{invitation.organizationName}</p><p className="mt-1 text-xs text-[#657084]">{invitation.organizationEmail} · {invitation.reportType} #{invitation.reportId}</p></div><span className={`inline-flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] ${invitation.status === "approved" ? "text-emerald-800" : invitation.status === "rejected" ? "text-red-800" : urgent ? "text-red-800" : "text-[#a27e2e]"}`}><Clock3 size={13} /> {invitation.status === "pending" ? countdown(invitation.expiresAt) : invitation.status}</span></div>{urgent && <div className="mt-3 border-l-2 border-red-700 bg-red-50 px-3 py-2 text-xs text-red-900">Reminder recommended: this invitation expires soon.</div>}{invitation.status === "pending" && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => review.mutate({ id: invitation.id, status: "approved" })} className="bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8]">Approve</button><button type="button" onClick={() => review.mutate({ id: invitation.id, status: "rejected" })} className="border border-red-800 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-red-800">Reject</button><button type="button" onClick={() => remind.mutate({ id: invitation.id })} disabled={remind.isPending || Boolean(invitation.reminderSentAt)} className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40">{invitation.reminderSentAt ? "Reminder sent" : "Send reminder"}</button></div>}</article>; })}</div>{(history.data?.rows.length ?? 0) === 0 && <p className="mt-5 text-sm text-[#657084]">No approval events match the current filters.</p>}{(history.data?.totalPages ?? 1) > 1 && <div className="mt-6 flex items-center justify-between border-t border-[#16243d]/10 pt-4"><span className="text-xs text-[#657084]">Page {history.data?.page ?? historyPage} of {history.data?.totalPages ?? 1}</span><div className="flex gap-2"><button type="button" onClick={() => setHistoryPage((page) => Math.max(1, page - 1))} disabled={historyPage <= 1} className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40">Previous</button><button type="button" onClick={() => setHistoryPage((page) => Math.min(history.data?.totalPages ?? page, page + 1))} disabled={historyPage >= (history.data?.totalPages ?? 1)} className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40">Next</button></div></div>}</section>;
}

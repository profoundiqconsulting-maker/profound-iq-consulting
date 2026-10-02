/* Profound IQ Consulting — My Certificates page. Shows all issued certificates for a learner with download, share, and verify actions. */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BrandLogo } from "@/components/BrandLogo";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  ImageDown,
  Loader2,
  Mail,
  MailCheck,
  Printer,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import { downloadCertificatePng } from "@/lib/certificatePng";
import { downloadCertificatePdf } from "@/lib/certificatePdf";

type Certificate = {
  id?: number;
  certificateNumber: string;
  courseTitle: string;
  fileUrl?: string | null;
  fileKey?: string | null;
  emailStatus?: string | null;
  emailedAt?: Date | string | null;
  createdAt?: Date | string | null;
  recipientName?: string;
  artifactHash?: string | null;
};

type CourseRecord = {
  enrollment: { id: number; name: string; email: string; courseSlug: string };
  certificates: Certificate[];
  stages: Array<{ stage: number; paymentStatus: string }>;
};

type CertificateWithEnrollment = Certificate & {
  enrollment: CourseRecord["enrollment"];
};

export default function MyCertificates() {
  const { user, loading: authLoading } = useAuth();
  const courseHistory = trpc.course.state.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: true,
  });

  const downloadPdf = trpc.course.downloadCertificatePdf.useMutation({
    onError: error =>
      toast.error("PDF download failed", { description: error.message }),
  });
  const recordEvent = trpc.course.recordCertificateUsage.useMutation();

  const [previewing, setPreviewing] = useState<Certificate | null>(null);

  const courseRecords = (courseHistory.data ?? []) as unknown as CourseRecord[];
  const allCertificates = courseRecords.flatMap(record =>
    (record.certificates ?? []).map(cert => ({
      ...cert,
      enrollment: record.enrollment,
    }))
  );

  const handleDownloadPdf = async (cert: CertificateWithEnrollment) => {
    if (!cert.enrollment) {
      toast.error("Could not download PDF", {
        description: "Enrollment information is missing.",
      });
      return;
    }
    try {
      const result = await downloadPdf.mutateAsync({
        enrollmentId: cert.enrollment.id,
      });
      downloadCertificatePdf(result.data, result.filename);
      recordEvent.mutate({
        enrollmentId: cert.enrollment.id,
        eventType: "download",
        platform: "pdf",
      });
      toast.success("Certificate PDF downloaded");
    } catch (error) {
      toast.error("Could not download PDF", {
        description: (error as Error).message,
      });
    }
  };

  const handleDownloadPng = async (cert: CertificateWithEnrollment) => {
    if (!cert.fileUrl) {
      toast.error("Preview not available", {
        description: "The certificate file URL is not yet available.",
      });
      return;
    }
    try {
      const response = await fetch(cert.fileUrl);
      const svg = await response.text();
      await downloadCertificatePng(svg, `${cert.certificateNumber}.png`);
      if (cert.enrollment) {
        recordEvent.mutate({
          enrollmentId: cert.enrollment.id,
          eventType: "download",
          platform: "png",
        });
      }
      toast.success("Certificate PNG downloaded");
    } catch (error) {
      toast.error("Could not download PNG", {
        description: (error as Error).message,
      });
    }
  };

  const handlePrint = (cert: Certificate) => {
    if (!cert.fileUrl) {
      toast.error("Preview not available");
      return;
    }
    const printWindow = window.open(
      cert.fileUrl,
      "_blank",
      "noopener,noreferrer"
    );
    if (printWindow) {
      window.setTimeout(() => printWindow.print(), 900);
    } else {
      toast.error("Allow pop-ups to print your certificate.");
    }
  };

  const handleCopyLink = (cert: Certificate) => {
    const verifyUrl = `${PUBLISHED_SITE_ORIGIN}/verify/certificate?certificate=${encodeURIComponent(cert.certificateNumber)}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Verification link copied", { description: verifyUrl });
  };

  const handleShare = async (cert: CertificateWithEnrollment) => {
    const verifyUrl = `${PUBLISHED_SITE_ORIGIN}/verify/certificate?certificate=${encodeURIComponent(cert.certificateNumber)}`;
    const shareData = {
      title: `Certificate — ${cert.courseTitle}`,
      text: `I completed ${cert.courseTitle} with Profound IQ Consulting. Verify my credential: ${cert.certificateNumber}`,
      url: verifyUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (cert.enrollment) {
          recordEvent.mutate({
            enrollmentId: cert.enrollment.id,
            eventType: "share",
            platform: "native",
          });
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Sharing failed", {
            description: (err as Error).message,
          });
        }
      }
    } else {
      handleCopyLink(cert);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="grid place-items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#8b6914]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-md py-20 text-center">
          <Award className="mx-auto h-12 w-12 text-[#8b6914]" />
          <h1 className="mt-6 display text-3xl text-[#16243d]">
            Sign in to view your certificates
          </h1>
          <p className="mt-3 text-sm text-[#4a566a]">
            Your earned certificates will appear here once you sign in.
          </p>
          <Link
            href="/auth?mode=login&returnTo=/dashboard/certificates"
            className="mt-6 inline-flex items-center gap-2 border border-[#c9a34e] px-5 py-3 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition-colors hover:bg-[#c9a34e]"
          >
            Sign in <ArrowUpRight size={14} />
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex flex-col gap-3 border-b border-[#16243d]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-[#7d5e1e]">YOUR CREDENTIALS</p>
            <h1 className="display mt-3 text-4xl leading-tight text-[#16243d] sm:text-5xl">
              My Certificates
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#4a566a]">
              Download, share, or verify any certificate you have earned through
              Profound IQ Consulting courses.
            </p>
          </div>
          <div className="text-right">
            <p className="display text-3xl text-[#16243d]">
              {allCertificates.length}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#657084]">
              Certificates earned
            </p>
          </div>
        </header>

        {courseHistory.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-sm border border-[#16243d]/10 bg-white/55"
              />
            ))}
          </div>
        ) : allCertificates.length === 0 ? (
          <div className="border border-dashed border-[#16243d]/20 py-16 text-center">
            <Award className="mx-auto h-10 w-10 text-[#8b6914]/60" />
            <h2 className="mt-5 display text-2xl text-[#16243d]">
              No certificates yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#657084]">
              Complete a course, pass all quizzes, and finish all four payment
              stages to earn your certificate of completion.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 border border-[#c9a34e] px-5 py-3 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition-colors hover:bg-[#c9a34e]"
            >
              Back to dashboard <ArrowUpRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allCertificates.map(cert => (
              <article
                key={cert.certificateNumber}
                className="group flex flex-col border border-[#16243d]/10 bg-white p-5 transition-all hover:border-[#c9a34e] hover:shadow-[0_8px_24px_rgba(16,29,53,.08)]"
              >
                <div className="flex items-start justify-between">
                  <Award className="h-7 w-7 text-[#8b6914]" />
                  {cert.emailStatus === "sent" ||
                  cert.emailStatus === "delivered" ? (
                    <span className="inline-flex items-center gap-1 border border-[#c9a34e]/40 bg-[#c9a34e]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                      <MailCheck size={10} /> Emailed
                    </span>
                  ) : cert.emailStatus === "failed" ? (
                    <span className="inline-flex items-center gap-1 border border-red-500/30 bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[.12em] text-red-700">
                      <Mail size={10} /> Resend
                    </span>
                  ) : null}
                </div>

                <h3 className="display mt-5 text-xl leading-tight text-[#16243d]">
                  {cert.courseTitle}
                </h3>

                <dl className="mt-4 space-y-1.5 text-[11px] text-[#657084]">
                  <div className="flex justify-between gap-3">
                    <dt className="font-bold uppercase tracking-[.1em] text-[#4a566a]">
                      Certificate
                    </dt>
                    <dd className="font-mono text-[#16243d]">
                      {cert.certificateNumber}
                    </dd>
                  </div>
                  {cert.createdAt && (
                    <div className="flex justify-between gap-3">
                      <dt className="font-bold uppercase tracking-[.1em] text-[#4a566a]">
                        Issued
                      </dt>
                      <dd className="text-[#16243d]">
                        {new Date(cert.createdAt).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </dd>
                    </div>
                  )}
                  {cert.artifactHash && (
                    <div className="flex justify-between gap-3">
                      <dt className="font-bold uppercase tracking-[.1em] text-[#4a566a]">
                        Hash
                      </dt>
                      <dd className="truncate font-mono text-[10px] text-[#16243d]">
                        {cert.artifactHash.slice(0, 10)}…
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#16243d]/10 pt-4">
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(cert)}
                    disabled={downloadPdf.isPending}
                    className="inline-flex items-center gap-1.5 border border-[#c9a34e] px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition-colors hover:bg-[#c9a34e] disabled:opacity-50"
                  >
                    <FileText size={12} /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPng(cert)}
                    disabled={!cert.fileUrl}
                    className="inline-flex items-center gap-1.5 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition-colors hover:border-[#c9a34e] hover:text-[#7d5e1e] disabled:opacity-50"
                  >
                    <ImageDown size={12} /> PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrint(cert)}
                    disabled={!cert.fileUrl}
                    className="inline-flex items-center gap-1.5 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition-colors hover:border-[#c9a34e] hover:text-[#7d5e1e] disabled:opacity-50"
                  >
                    <Printer size={12} /> Print
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(cert)}
                    className="inline-flex items-center gap-1.5 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition-colors hover:border-[#c9a34e] hover:text-[#7d5e1e]"
                  >
                    <Share2 size={12} /> Share
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/verify/certificate?certificate=${encodeURIComponent(cert.certificateNumber)}`}
                    className="inline-flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#7d5e1e] hover:text-[#16243d]"
                  >
                    <ShieldCheck size={11} /> Verify credential{" "}
                    <ExternalLink size={10} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(cert)}
                    className="ml-auto inline-flex items-center gap-1 px-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#657084] hover:text-[#16243d]"
                  >
                    <Copy size={11} /> Copy link
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {previewing && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-[#071225]/80 p-5 backdrop-blur-sm"
            role="presentation"
            onClick={e => e.target === e.currentTarget && setPreviewing(null)}
          >
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto border border-[#c9a34e]/70 bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="display text-xl text-[#16243d]">
                  Certificate preview
                </h2>
                <button
                  type="button"
                  onClick={() => setPreviewing(null)}
                  className="text-xs font-bold uppercase tracking-[.12em] text-[#657084] hover:text-[#16243d]"
                >
                  Close
                </button>
              </div>
              {previewing.fileUrl ? (
                <img
                  src={previewing.fileUrl}
                  alt={`Certificate ${previewing.certificateNumber}`}
                  className="w-full"
                />
              ) : (
                <p className="py-10 text-center text-sm text-[#657084]">
                  Preview not available.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

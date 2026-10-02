import {
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TransformationNav } from "@/components/TransformationNav";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AssessmentVerification() {
  const reference =
    new URLSearchParams(window.location.search).get("reference")?.trim() ?? "";
  const verification = trpc.assessment.verifyAssessmentCertificate.useQuery(
    { reference },
    { enabled: reference.length >= 10, retry: false }
  );
  const certificate = verification.data;
  const downloadVerification =
    trpc.course.downloadVerificationReport.useMutation();

  const handleDownloadVerification = async () => {
    if (!certificate) return;
    try {
      const verificationReport = await downloadVerification.mutateAsync({
        type: "assessment",
        reference,
        respondentName: certificate.recipientName,
        credentialTitle: certificate.courseTitle,
        issuedAt: new Date(certificate.createdAt).toISOString(),
      });
      const bytes = Uint8Array.from(atob(verificationReport.data), character =>
        character.charCodeAt(0)
      );
      const blob = new Blob([bytes], { type: verificationReport.contentType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = verificationReport.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Verification report downloaded");
    } catch (error) {
      toast.error("Unable to download verification report");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <TransformationNav active="assessment" />
      <main className="container py-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-[#7d5e1e]">
            Assessment certificate verification
          </p>
          <h1 className="display mt-4 text-5xl leading-none sm:text-7xl">
            A credential you can trust.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#4a566a]">
            Use this public page to confirm that a Profound IQ Self Assessment
            certificate was issued and to compare its canonical artifact
            fingerprint.
          </p>
          {!reference ? (
            <section className="mt-10 flex items-start gap-4 border-l-2 border-red-700 bg-white/65 p-6 sm:p-8">
              <XCircle className="shrink-0 text-red-700" size={28} />
              <div>
                <h2 className="display text-2xl">Reference required</h2>
                <p className="mt-3 text-sm leading-6 text-[#657084]">
                  Open the complete verification link from the certificate QR
                  code or email.
                </p>
              </div>
            </section>
          ) : verification.isLoading ? (
            <section className="mt-10 flex items-start gap-4 border-l-2 border-[#c9a34e] bg-white/65 p-6 sm:p-8">
              <ShieldCheck className="animate-pulse text-[#7d5e1e]" size={28} />
              <div>
                <h2 className="display text-2xl">Checking certificate</h2>
                <p className="mt-3 text-sm leading-6 text-[#657084]">
                  We are checking the assessment reference against the
                  credential register.
                </p>
              </div>
            </section>
          ) : certificate ? (
            <section className="mt-10 border border-[#c9a34e]/70 bg-white/70 p-6 shadow-sm sm:p-10">
              <div className="flex items-start gap-4">
                <CheckCircle2
                  className="mt-1 shrink-0 text-emerald-800"
                  size={30}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-800">
                    Verified · active credential
                  </p>
                  <h2 className="display mt-3 text-3xl sm:text-4xl">
                    {certificate.courseTitle}
                  </h2>
                  <dl className="mt-7 grid gap-5 border-t border-[#16243d]/12 pt-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[.14em] text-[#16243d]">
                        Awarded to
                      </dt>
                      <dd className="mt-2 text-lg font-semibold text-[#16243d]">
                        {certificate.recipientName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[.14em] text-[#16243d]">
                        Certificate number
                      </dt>
                      <dd className="mt-2 break-all font-mono text-sm text-[#16243d]">
                        {certificate.certificateNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[.14em] text-[#16243d]">
                        Issued
                      </dt>
                      <dd className="mt-2 text-sm text-[#16243d]">
                        {new Date(certificate.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[.14em] text-[#16243d]">
                        Issuer
                      </dt>
                      <dd className="mt-2 text-sm text-[#16243d]">
                        Profound IQ Consulting
                      </dd>
                    </div>
                    {certificate.artifactHash && (
                      <div className="sm:col-span-2">
                        <dt className="text-[10px] font-black uppercase tracking-[.14em] text-[#16243d]">
                          Artifact hash
                        </dt>
                        <dd className="mt-2 break-all font-mono text-xs text-[#16243d]">
                          {certificate.artifactHash}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-6">
                    <Button
                      onClick={handleDownloadVerification}
                      disabled={downloadVerification.isPending}
                      className="bg-[#16243d] text-[#f7f3e8]"
                    >
                      <Download size={16} className="mr-2" />
                      {downloadVerification.isPending
                        ? "Preparing verification report…"
                        : "Download verification report"}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="mt-10 flex items-start gap-4 border-l-2 border-red-700 bg-white/65 p-6 sm:p-8">
              <XCircle className="shrink-0 text-red-700" size={28} />
              <div>
                <h2 className="display text-2xl">Reference not found</h2>
                <p className="mt-3 text-sm leading-6 text-[#657084]">
                  We could not find a paid assessment certificate matching this
                  reference. Double-check the reference or contact support.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

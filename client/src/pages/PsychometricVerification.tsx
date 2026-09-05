import { CheckCircle2, Download, ShieldCheck, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { toast } from "sonner";

export default function PsychometricVerification() {
  const { t } = useLocale();
  const reference = new URLSearchParams(window.location.search).get("reference") ?? "";
  const result = trpc.psychometric.verifyPublic.useQuery({ reference }, { enabled: reference.length >= 15, retry: false });
  const downloadVerification = trpc.course.downloadVerificationReport.useMutation();

  const handleDownloadVerification = async () => {
    if (!result.data?.valid) return;
    try {
      const verification = await downloadVerification.mutateAsync({
        type: "psychometric",
        reference,
        respondentName: result.data.participantName,
        credentialTitle: result.data.testTitle,
        issuedAt: new Date(result.data.issuedAt).toISOString(),
      });
      const bytes = Uint8Array.from(atob(verification.data), (character) => character.charCodeAt(0));
      const blob = new Blob([bytes], { type: verification.contentType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = verification.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Verification report downloaded");
    } catch (error) {
      toast.error("Unable to download verification report");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f3e8] px-4 py-12 text-[#16243d]">
      <Card className="w-full max-w-xl border-[#c9a34e]/60 bg-[#fffdf7]">
        <CardHeader className="bg-[#16243d] text-[#f7f3e8]">
          <p className="eyebrow text-[#c9a34e]">PROFOUND IQ / AUTHENTICITY CHECK</p>
          <CardTitle className="display mt-3 text-4xl">Psychometric report verification</CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          {!reference ? (
            <div className="flex items-start gap-3 text-red-900">
              <XCircle size={22} />
              <p>A verification reference was not supplied.</p>
            </div>
          ) : result.isLoading ? (
            <p className="text-sm text-[#16243d]">Checking the secure report record…</p>
          ) : result.data?.valid ? (
            <div>
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 size={25} />
                <div>
                  <p className="font-bold">Authentic paid report</p>
                  <p className="text-sm">This record matches Profound IQ Consulting’s verification ledger.</p>
                </div>
              </div>
              <div className="mt-7 grid gap-4 border-t border-[#16243d]/10 pt-6 text-sm">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">Report number</span>
                  <strong className="text-[#16243d]">{result.data.reportNumber}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">Respondent</span>
                  <strong className="text-[#16243d]">{result.data.participantName}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">Profile</span>
                  <strong className="text-[#16243d]">{result.data.testTitle}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">Overall signal</span>
                  <strong className="text-[#16243d]">{result.data.overallScore}/100 · {result.data.overallBand}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">Issued</span>
                  <strong className="text-[#16243d]">{new Date(result.data.issuedAt).toLocaleString()}</strong>
                </div>
              </div>
              <div className="mt-7 flex items-center gap-2 border-l-2 border-[#c9a34e] bg-[#ece5d6] p-4 text-xs leading-6 text-[#16243d]">
                <ShieldCheck size={18} className="shrink-0 text-[#16243d]" />
                <span>This verification page confirms that the report was issued by Profound IQ Consulting and has not been altered. For verifier audits, retain this reference and issuance date.</span>
              </div>
              <div className="mt-6">
                <Button onClick={handleDownloadVerification} disabled={downloadVerification.isPending} className="bg-[#16243d] text-[#f7f3e8]">
                  <Download size={16} className="mr-2" />
                  {downloadVerification.isPending ? "Preparing verification report…" : "Download verification report"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 text-red-900">
              <XCircle size={22} />
              <div>
                <p className="font-bold">Reference not found</p>
                <p className="text-sm">We could not find a paid psychometric report matching this reference. Double-check the reference or contact support.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

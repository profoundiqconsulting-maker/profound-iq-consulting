import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Share2,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialMediaIcons";
import { Link } from "wouter";
import { TransformationNav } from "@/components/TransformationNav";
import { trpc } from "@/lib/trpc";

import { toast } from "sonner";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

const copy = {
  en: [
    "Credential verification",
    "A credential you can trust.",
    "Use this public page to confirm that a Profound IQ Consulting course certificate was issued and remains active.",
    "Certificate number required",
    "Scan the QR code on a Profound IQ certificate or open a link containing its certificate number.",
    "Checking credential",
    "We are checking the certificate number against the credential register.",
    "Verified · active credential",
    "Awarded to",
    "Certificate number",
    "Issued",
    "Issuer",
    "Credential not found",
    "We could not match this certificate number to an active credential.",
    "Verification service unavailable. Please try again shortly.",
    "Explore professional courses",
  ],
  sw: [
    "Uthibitishaji wa cheti",
    "Kitambulisho unachoweza kuamini.",
    "Tumia ukurasa huu wa umma kuthibitisha kuwa cheti cha Profound IQ Consulting kilitolewa na bado kinafanya kazi.",
    "Nambari ya cheti inahitajika",
    "Changanua msimbo wa QR kwenye cheti au fungua kiungo chenye nambari ya cheti.",
    "Inakagua kitambulisho",
    "Tunaangalia nambari dhidi ya rejista ya vitambulisho.",
    "Imethibitishwa · kitambulisho hai",
    "Aliyetunukiwa",
    "Nambari ya cheti",
    "Kilichotolewa",
    "Mtoaji",
    "Kitambulisho hakikupatikana",
    "Hatukuweza kuoanisha nambari hii na kitambulisho hai.",
    "Huduma ya uthibitishaji haipatikani. Jaribu tena baadaye.",
    "Chunguza kozi za kitaalamu",
  ],
  fr: [
    "Vérification du titre",
    "Un titre digne de confiance.",
    "Utilisez cette page publique pour confirmer qu’un certificat Profound IQ Consulting a été délivré et reste actif.",
    "Numéro de certificat requis",
    "Scannez le QR du certificat ou ouvrez un lien contenant son numéro.",
    "Vérification en cours",
    "Nous vérifions le numéro dans le registre des titres.",
    "Vérifié · titre actif",
    "Attribué à",
    "Numéro du certificat",
    "Délivré",
    "Émetteur",
    "Titre introuvable",
    "Ce numéro ne correspond pas à un titre actif.",
    "Service indisponible. Veuillez réessayer.",
    "Découvrir les cours professionnels",
  ],
  es: [
    "Verificación de credenciales",
    "Una credencial en la que puedes confiar.",
    "Confirma aquí que un certificado de Profound IQ Consulting fue emitido y sigue activo.",
    "Se requiere el número del certificado",
    "Escanea el código QR del certificado o abre un enlace con su número.",
    "Comprobando credencial",
    "Estamos comprobando el número en el registro.",
    "Verificado · credencial activa",
    "Otorgado a",
    "Número del certificado",
    "Emitido",
    "Emisor",
    "Credencial no encontrada",
    "No pudimos asociar este número con una credencial activa.",
    "Servicio no disponible. Inténtalo de nuevo.",
    "Explorar cursos profesionales",
  ],
  pt: [
    "Verificação de credencial",
    "Uma credencial em que pode confiar.",
    "Confirme nesta página pública que um certificado da Profound IQ Consulting foi emitido e continua ativo.",
    "Número do certificado obrigatório",
    "Leia o QR do certificado ou abra um link com o respetivo número.",
    "A verificar credencial",
    "Estamos a verificar o número no registo.",
    "Verificado · credencial ativa",
    "Atribuído a",
    "Número do certificado",
    "Emitido",
    "Emissor",
    "Credencial não encontrada",
    "Não encontrámos este número numa credencial ativa.",
    "Serviço indisponível. Tente novamente.",
    "Explorar cursos profissionais",
  ],
  ar: [
    "التحقق من الاعتماد",
    "اعتماد يمكنك الوثوق به.",
    "استخدم هذه الصفحة العامة للتأكد من إصدار شهادة Profound IQ Consulting وبقائها فعّالة.",
    "رقم الشهادة مطلوب",
    "امسح رمز QR على الشهادة أو افتح رابطاً يتضمن رقمها.",
    "جارٍ التحقق",
    "نتحقق من الرقم في سجل الاعتمادات.",
    "تم التحقق · اعتماد فعّال",
    "مُنحت إلى",
    "رقم الشهادة",
    "تاريخ الإصدار",
    "الجهة المصدرة",
    "لم يُعثر على الاعتماد",
    "تعذر مطابقة الرقم مع اعتماد فعّال.",
    "خدمة التحقق غير متاحة. حاول مرة أخرى لاحقاً.",
    "استكشف الدورات المهنية",
  ],
  zh: [
    "凭证验证",
    "值得信赖的凭证。",
    "使用此公开页面确认 Profound IQ Consulting 课程证书已签发且仍然有效。",
    "需要证书编号",
    "扫描证书上的二维码，或打开包含证书编号的链接。",
    "正在验证凭证",
    "我们正在凭证登记处核对编号。",
    "已验证 · 有效凭证",
    "授予对象",
    "证书编号",
    "签发日期",
    "签发方",
    "未找到凭证",
    "无法将此编号与有效凭证匹配。",
    "验证服务暂不可用，请稍后重试。",
    "探索专业课程",
  ],
  hi: [
    "प्रमाण-पत्र सत्यापन",
    "एक विश्वसनीय प्रमाण-पत्र।",
    "इस सार्वजनिक पृष्ठ से पुष्टि करें कि Profound IQ Consulting का प्रमाण-पत्र जारी हुआ है और सक्रिय है।",
    "प्रमाण-पत्र संख्या आवश्यक है",
    "प्रमाण-पत्र का QR कोड स्कैन करें या संख्या वाला लिंक खोलें।",
    "प्रमाण-पत्र जाँचा जा रहा है",
    "हम रजिस्टर में संख्या जाँच रहे हैं।",
    "सत्यापित · सक्रिय प्रमाण-पत्र",
    "प्रदान किया गया",
    "प्रमाण-पत्र संख्या",
    "जारी किया गया",
    "जारीकर्ता",
    "प्रमाण-पत्र नहीं मिला",
    "यह संख्या किसी सक्रिय प्रमाण-पत्र से मेल नहीं खाती।",
    "सत्यापन सेवा उपलब्ध नहीं है। बाद में पुनः प्रयास करें।",
    "पेशेवर पाठ्यक्रम देखें",
  ],
  de: [
    "Nachweisprüfung",
    "Ein Nachweis, dem Sie vertrauen können.",
    "Bestätigen Sie auf dieser öffentlichen Seite, dass ein Profound IQ Consulting-Zertifikat ausgestellt wurde und aktiv ist.",
    "Zertifikatsnummer erforderlich",
    "Scannen Sie den QR-Code auf dem Zertifikat oder öffnen Sie einen Link mit der Nummer.",
    "Nachweis wird geprüft",
    "Wir prüfen die Nummer im Nachweisregister.",
    "Verifiziert · aktiver Nachweis",
    "Verliehen an",
    "Zertifikatsnummer",
    "Ausgestellt",
    "Aussteller",
    "Nachweis nicht gefunden",
    "Diese Nummer konnte keinem aktiven Nachweis zugeordnet werden.",
    "Prüfdienst nicht verfügbar. Bitte später erneut versuchen.",
    "Professionelle Kurse entdecken",
  ],
  ja: [
    "資格証明の確認",
    "信頼できる資格証明。",
    "この公開ページで、Profound IQ Consulting の修了証が発行済みで有効か確認できます。",
    "証明書番号が必要です",
    "証明書のQRコードを読み取るか、番号を含むリンクを開いてください。",
    "資格証明を確認中",
    "登録簿で番号を確認しています。",
    "確認済み · 有効な資格証明",
    "授与対象",
    "証明書番号",
    "発行日",
    "発行者",
    "資格証明が見つかりません",
    "この番号を有効な資格証明と照合できませんでした。",
    "確認サービスを利用できません。しばらくして再試行してください。",
    "専門コースを見る",
  ],
} as const;

const actionCopy = {
  en: {
    share: "Share certificate",
    nativeShare: "Share",
    copy: "Copy link",
    copied: "Copied",
    copyError: "Unable to copy the verification link",
    shareError: "Unable to open sharing",
    verificationUrl: "Verification URL",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
  sw: {
    share: "Shiriki cheti",
    nativeShare: "Shiriki",
    copy: "Nakili kiungo",
    copied: "Imenakiliwa",
    copyError: "Imeshindikana kunakili kiungo cha uthibitishaji",
    shareError: "Imeshindikana kufungua kushiriki",
    verificationUrl: "Kiungo cha uthibitishaji",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
  fr: {
    share: "Partager le certificat",
    nativeShare: "Partager",
    copy: "Copier le lien",
    copied: "Copié",
    copyError: "Impossible de copier le lien de vérification",
    shareError: "Impossible d’ouvrir le partage",
    verificationUrl: "Lien de vérification",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
  es: {
    share: "Compartir certificado",
    nativeShare: "Compartir",
    copy: "Copiar enlace",
    copied: "Copiado",
    copyError: "No se pudo copiar el enlace de verificación",
    shareError: "No se pudo abrir el uso compartido",
    verificationUrl: "Enlace de verificación",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
  pt: {
    share: "Partilhar certificado",
    nativeShare: "Partilhar",
    copy: "Copiar ligação",
    copied: "Copiado",
    copyError: "Não foi possível copiar a ligação de verificação",
    shareError: "Não foi possível abrir a partilha",
    verificationUrl: "Ligação de verificação",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
  ar: {
    share: "مشاركة الشهادة",
    nativeShare: "مشاركة",
    copy: "نسخ الرابط",
    copied: "تم النسخ",
    copyError: "تعذر نسخ رابط التحقق",
    shareError: "تعذر فتح المشاركة",
    verificationUrl: "رابط التحقق",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
  zh: {
    share: "分享证书",
    nativeShare: "分享",
    copy: "复制链接",
    copied: "已复制",
    copyError: "无法复制验证链接",
    shareError: "无法打开分享",
    verificationUrl: "验证链接",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
  hi: {
    share: "प्रमाण-पत्र साझा करें",
    nativeShare: "साझा करें",
    copy: "लिंक कॉपी करें",
    copied: "कॉपी हो गया",
    copyError: "सत्यापन लिंक कॉपी नहीं हो सका",
    shareError: "शेयरिंग नहीं खुल सकी",
    verificationUrl: "सत्यापन लिंक",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
  de: {
    share: "Zertifikat teilen",
    nativeShare: "Teilen",
    copy: "Link kopieren",
    copied: "Kopiert",
    copyError: "Der Prüf-Link konnte nicht kopiert werden",
    shareError: "Teilen konnte nicht geöffnet werden",
    verificationUrl: "Prüf-Link",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
  ja: {
    share: "証明書を共有",
    nativeShare: "共有",
    copy: "リンクをコピー",
    copied: "コピーしました",
    copyError: "確認リンクをコピーできませんでした",
    shareError: "共有を開けませんでした",
    verificationUrl: "確認リンク",
    linkedIn: "LinkedIn",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    x: "X",
  },
} as const;

export default function CertificateVerification() {
  const certificateNumber = useMemo(
    () =>
      new URLSearchParams(window.location.search).get("certificate")?.trim() ??
      "",
    []
  );
  const verification = trpc.course.verifyCertificate.useQuery(
    { certificateNumber },
    { enabled: certificateNumber.length >= 6, retry: false }
  );
  const certificate = verification.data;
  const verificationUrl = useMemo(
    () =>
      `${PUBLISHED_SITE_ORIGIN}/verify/certificate?certificate=${encodeURIComponent(certificateNumber)}`,
    [certificateNumber]
  );
  const [copied, setCopied] = useState(false);
  const actions = actionCopy.en;
  const nativeShareSupported =
    typeof navigator !== "undefined" && "share" in navigator;
  const recordShare = trpc.course.recordCertificateShare.useMutation();

  const downloadVerification =
    trpc.course.downloadVerificationReport.useMutation();
  const handleDownloadVerification = async () => {
    if (!certificate) return;
    try {
      const verification = await downloadVerification.mutateAsync({
        type: "certificate",
        reference: certificateNumber,
        certificateNumber: certificate.certificateNumber,
        respondentName: certificate.recipientName,
        credentialTitle: certificate.courseTitle,
        issuedAt: certificate.createdAt
          ? new Date(certificate.createdAt).toISOString()
          : new Date().toISOString(),
        artifactHash: certificate.artifactHash ?? "",
      });
      const bytes = Uint8Array.from(atob(verification.data), character =>
        character.charCodeAt(0)
      );
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

  const recordShareEvent = (
    platform: "native" | "linkedin" | "facebook" | "whatsapp" | "x"
  ) => {
    if (!certificateNumber) return;
    void recordShare
      .mutateAsync({
        platform,
        certificateNumber,
        courseTitle: certificate?.courseTitle,
      })
      .catch(() => undefined);
  };
  const openShare = (platform: "linkedin" | "facebook" | "whatsapp" | "x") => {
    recordShareEvent(platform);
    const text = `Verify this Profound IQ Consulting certificate: ${certificate?.courseTitle ?? "Professional achievement"}`;
    const target =
      platform === "linkedin"
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`
        : platform === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verificationUrl)}`
          : platform === "whatsapp"
            ? `https://wa.me/?text=${encodeURIComponent(`${text} ${verificationUrl}`)}`
            : `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(verificationUrl)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };
  const nativeShare = async () => {
    if (!("share" in navigator)) return;
    try {
      await navigator.share({
        title: certificate?.courseTitle ?? "Profound IQ Consulting certificate",
        text: `Verify this Profound IQ Consulting certificate: ${certificate?.courseTitle ?? "Professional achievement"}`,
        url: verificationUrl,
      });
      recordShareEvent("native");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(actions.shareError);
    }
  };
  const copyVerificationUrl = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      toast.success(actions.copied);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error(actions.copyError);
    }
  };
  const [
    eyebrow,
    title,
    intro,
    required,
    scan,
    checking,
    checkingBody,
    active,
    awarded,
    number,
    issued,
    issuer,
    notFound,
    notFoundBody,
    unavailable,
    explore,
  ] = copy.en;
  const status = (icon: React.ReactNode, heading: string, body: string) => (
    <section className="mt-10 flex items-start gap-4 border-l-2 border-[var(--brand)] bg-white/65 p-6 sm:p-8">
      <div>{icon}</div>
      <div>
        <h2 className="display text-2xl">{heading}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
      </div>
    </section>
  );
  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[var(--fg)]">
      <TransformationNav active="assessment" />
      <main className="container py-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-[var(--brand)]">{eyebrow}</p>
          <h1 className="display mt-4 text-5xl leading-none sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            {intro}
          </p>
          {!certificateNumber ? (
            status(
              <XCircle className="text-red-700" size={28} />,
              required,
              scan
            )
          ) : verification.isLoading ? (
            status(
              <ShieldCheck
                className="animate-pulse text-[var(--brand)]"
                size={28}
              />,
              checking,
              checkingBody
            )
          ) : certificate ? (
            <section className="mt-10 border border-[var(--brand)]/70 bg-white/70 p-6 shadow-sm sm:p-10">
              <div className="flex items-start gap-4">
                <CheckCircle2
                  className="mt-1 shrink-0 text-emerald-800"
                  size={30}
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-800">
                    {active}
                  </p>
                  <h2 className="display mt-3 text-3xl sm:text-4xl">
                    {certificate.courseTitle}
                  </h2>
                  <dl className="mt-7 grid gap-5 border-t border-[#16243d]/12 pt-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">
                        {awarded}
                      </dt>
                      <dd className="mt-2 text-lg font-semibold">
                        {certificate.recipientName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">
                        {number}
                      </dt>
                      <dd className="mt-2 break-all font-mono text-sm">
                        {certificate.certificateNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">
                        {issued}
                      </dt>
                      <dd className="mt-2 text-sm">
                        {new Date(certificate.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">
                        {issuer}
                      </dt>
                      <dd className="mt-2 text-sm">Profound IQ Consulting</dd>
                    </div>
                    {certificate.artifactHash && (
                      <div className="sm:col-span-2">
                        <dt className="text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">
                          Artifact hash
                        </dt>
                        <dd className="mt-2 break-all font-mono text-xs text-muted-foreground">
                          {certificate.artifactHash}
                        </dd>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          This SHA-256 fingerprint identifies the exact issued
                          certificate artwork used for its generated formats.
                        </p>
                      </div>
                    )}
                    <div className="sm:col-span-2 border-t border-[#16243d]/12 pt-5">
                      <dt className="text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">
                        {actions.verificationUrl}
                      </dt>
                      <dd className="mt-2 break-all rounded-sm bg-[#16243d]/5 p-3 font-mono text-xs text-muted-foreground">
                        {verificationUrl}
                      </dd>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void copyVerificationUrl()}
                          className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] hover:border-[var(--brand)]"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                          {copied ? actions.copied : actions.copy}
                        </button>
                        {nativeShareSupported && (
                          <button
                            type="button"
                            onClick={() => void nativeShare()}
                            className="inline-flex items-center gap-2 bg-[var(--brand)] px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand-fg)] hover:bg-[#d7b762]"
                          >
                            <Share2 size={14} /> {actions.nativeShare}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openShare("linkedin")}
                          className="inline-flex items-center gap-2 border border-[#0A66C2]/50 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
                        >
                          <SocialIcon platform="linkedin" /> {actions.linkedIn}
                        </button>
                        <button
                          type="button"
                          onClick={() => openShare("facebook")}
                          className="inline-flex items-center gap-2 border border-[#1877F2]/50 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                        >
                          <SocialIcon platform="facebook" /> {actions.facebook}
                        </button>
                        <button
                          type="button"
                          onClick={() => openShare("whatsapp")}
                          className="inline-flex items-center gap-2 border border-[#25D366]/60 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#168b45] hover:bg-[#25D366] hover:text-white"
                        >
                          {actions.whatsapp}
                        </button>
                        <button
                          type="button"
                          onClick={() => openShare("x")}
                          className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] hover:bg-[#16243d] hover:text-white"
                        >
                          <X size={14} /> X
                        </button>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            </section>
          ) : (
            status(
              <XCircle className="text-red-700" size={28} />,
              notFound,
              notFoundBody
            )
          )}
          {verification.error && certificateNumber && (
            <p className="mt-4 text-sm text-red-800">{unavailable}</p>
          )}
          <Link
            href="/courses"
            className="mt-8 inline-flex items-center gap-2 border border-[#16243d]/25 px-5 py-3 text-[10px] font-black uppercase tracking-[.14em] hover:border-[var(--brand)]"
          >
            {explore} <ExternalLink size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
}

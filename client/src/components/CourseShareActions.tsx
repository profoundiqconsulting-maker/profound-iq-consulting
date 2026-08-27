/* Profound IQ Consulting — compact share rail with localized, accessible actions. */
import { useState } from "react";
import { Copy, Linkedin, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocale, type LocaleCode } from "@/contexts/LocaleContext";

type CourseShareActionsProps = { courseSlug?: string; courseTitle: string; shareUrl?: string; shareLabel?: string; pagePath?: string };
type ShareCopy = { label: string; linkedin: string; whatsapp: string; email: string; copied: string; copyError: string; success: string };
const copy: Record<LocaleCode, ShareCopy> = {
  en: { label: "Share this pathway", linkedin: "LinkedIn", whatsapp: "WhatsApp", email: "Email", copied: "Copied", copyError: "Could not copy the share link", success: "Share link copied" },
  sw: { label: "Shiriki njia hii", linkedin: "LinkedIn", whatsapp: "WhatsApp", email: "Barua pepe", copied: "Imenakiliwa", copyError: "Kiungo hakikunakiliwa", success: "Kiungo kimenakiliwa" },
  fr: { label: "Partager ce parcours", linkedin: "LinkedIn", whatsapp: "WhatsApp", email: "E-mail", copied: "Copié", copyError: "Impossible de copier le lien", success: "Lien copié" },
  es: { label: "Comparte esta ruta", linkedin: "LinkedIn", whatsapp: "WhatsApp", email: "Correo", copied: "Copiado", copyError: "No se pudo copiar el enlace", success: "Enlace copiado" },
  pt: { label: "Partilhar este percurso", linkedin: "LinkedIn", whatsapp: "WhatsApp", email: "E-mail", copied: "Copiado", copyError: "Não foi possível copiar o link", success: "Link copiado" },
  ar: { label: "شارك هذا المسار", linkedin: "LinkedIn", whatsapp: "واتساب", email: "البريد الإلكتروني", copied: "تم النسخ", copyError: "تعذر نسخ الرابط", success: "تم نسخ الرابط" },
  zh: { label: "分享此学习路径", linkedin: "LinkedIn", whatsapp: "WhatsApp", email: "电子邮件", copied: "已复制", copyError: "无法复制分享链接", success: "链接已复制" },
  hi: { label: "इस मार्ग को साझा करें", linkedin: "LinkedIn", whatsapp: "WhatsApp", email: "ईमेल", copied: "कॉपी हुआ", copyError: "शेयर लिंक कॉपी नहीं हो सका", success: "शेयर लिंक कॉपी हुआ" },
  de: { label: "Diesen Lernpfad teilen", linkedin: "LinkedIn", whatsapp: "WhatsApp", email: "E-Mail", copied: "Kopiert", copyError: "Freigabelink konnte nicht kopiert werden", success: "Freigabelink kopiert" },
  ja: { label: "この学習パスを共有", linkedin: "LinkedIn", whatsapp: "WhatsApp", email: "メール", copied: "コピー済み", copyError: "共有リンクをコピーできません", success: "共有リンクをコピーしました" },
};

export function CourseShareActions({ courseSlug, courseTitle, shareUrl: providedShareUrl, shareLabel, pagePath }: CourseShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const { locale } = useLocale();
  const labels = copy[locale];
  const trackShare = trpc.analytics.track.useMutation();
  const getShareUrl = () => providedShareUrl ?? `${window.location.origin}/courses/${encodeURIComponent(courseSlug ?? "")}`;
  const localizedMessage = `${courseTitle} — ${labels.label}.`;
  const track = (platform: string) => trackShare.mutate({ eventName: "course_shared", metadata: { platform, courseSlug: courseSlug ?? "comparison", ...(providedShareUrl?.includes("compare=") ? { comparisonSlugs: providedShareUrl.split("compare=")[1] } : {}), pagePath: pagePath ?? window.location.pathname, locale } });
  const share = (platform: "linkedin" | "whatsapp" | "email") => { const url = getShareUrl(); const encodedUrl = encodeURIComponent(url); const destinations = { linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, whatsapp: `https://wa.me/?text=${encodeURIComponent(`${localizedMessage} ${url}`)}`, email: `mailto:?subject=${encodeURIComponent(courseTitle)}&body=${encodeURIComponent(`${localizedMessage}\n${url}`)}` }; track(platform); window.open(destinations[platform], platform === "email" ? "_self" : "_blank", platform === "email" ? undefined : "noopener,noreferrer"); };
  const copyLink = async () => { try { await navigator.clipboard.writeText(getShareUrl()); setCopied(true); track("copy_link"); toast.success(labels.success); window.setTimeout(() => setCopied(false), 1800); } catch { toast.error(labels.copyError); } };
  const nativeShare = async () => { if (!navigator.share) return copyLink(); try { await navigator.share({ title: courseTitle, text: localizedMessage, url: getShareUrl() }); track("native"); } catch { /* User cancellation is intentionally quiet. */ } };
  return <div className="mt-7 border border-[#c9a34e]/45 bg-[#fffaf0] p-3 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md" aria-label={`${shareLabel ?? labels.label}: ${courseTitle}`}><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-[#7d5e1e]"><Share2 size={14} /> {shareLabel ?? labels.label}</div><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => share("linkedin")} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><Linkedin size={14} /> {labels.linkedin}</Button><Button type="button" variant="outline" size="sm" onClick={() => share("whatsapp")} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><MessageCircle size={14} /> {labels.whatsapp}</Button><Button type="button" variant="outline" size="sm" onClick={() => share("email")} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><Mail size={14} /> {labels.email}</Button><Button type="button" variant="outline" size="sm" onClick={nativeShare} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><Copy size={14} /> {copied ? labels.copied : "Copy link"}</Button></div></div>;
}

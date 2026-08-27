/* Profound IQ Consulting — compact share rail with direct, accessible actions and restrained gold motion. */
import { useState } from "react";
import { Copy, Linkedin, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type CourseShareActionsProps = {
  courseSlug?: string;
  courseTitle: string;
  shareUrl?: string;
  shareLabel?: string;
  pagePath?: string;
};

export function CourseShareActions({ courseSlug, courseTitle, shareUrl: providedShareUrl, shareLabel = "Share this course", pagePath }: CourseShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const trackShare = trpc.analytics.track.useMutation();
  const getShareUrl = () => providedShareUrl ?? `${window.location.origin}/courses/${encodeURIComponent(courseSlug ?? "")}`;
  const track = (platform: string) => {
    trackShare.mutate({ eventName: "course_shared", metadata: { platform, courseSlug: courseSlug ?? "comparison", pagePath: pagePath ?? window.location.pathname } });
  };
  const share = (platform: "linkedin" | "whatsapp" | "email") => {
    const url = getShareUrl();
    const encodedUrl = encodeURIComponent(url);
    const destinations = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Explore ${courseTitle} from Profound IQ Consulting: ${url}`)}`,
      email: `mailto:?subject=${encodeURIComponent(`Course recommendation: ${courseTitle}`)}&body=${encodeURIComponent(`I thought you might find this Profound IQ Consulting pathway useful: ${url}`)}`,
    };
    track(platform);
    window.open(destinations[platform], platform === "email" ? "_self" : "_blank", platform === "email" ? undefined : "noopener,noreferrer");
  };
  const copy = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("copy_link");
      toast.success("Share link copied", { description: "You can now paste it into a message or post." });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the share link", { description: url });
    }
  };
  const nativeShare = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: courseTitle, text: `Explore ${courseTitle} from Profound IQ Consulting.`, url: getShareUrl() });
      track("native");
    } catch {
      /* User cancellation is intentionally quiet. */
    }
  };
  return <div className="mt-7 border border-[#c9a34e]/45 bg-[#fffaf0] p-3 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4" aria-label={`${shareLabel} for ${courseTitle}`}><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-[#7d5e1e]"><Share2 size={14} /> {shareLabel}</div><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => share("linkedin")} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><Linkedin size={14} /> LinkedIn</Button><Button type="button" variant="outline" size="sm" onClick={() => share("whatsapp")} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><MessageCircle size={14} /> WhatsApp</Button><Button type="button" variant="outline" size="sm" onClick={() => share("email")} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><Mail size={14} /> Email</Button><Button type="button" variant="outline" size="sm" onClick={nativeShare} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><Copy size={14} /> {copied ? "Copied" : "Copy link"}</Button></div></div>;
}

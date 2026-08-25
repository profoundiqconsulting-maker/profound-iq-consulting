import { useState } from "react";
import { Copy, Linkedin, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type CourseShareActionsProps = { courseSlug: string; courseTitle: string };

export function CourseShareActions({ courseSlug, courseTitle }: CourseShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const trackShare = trpc.analytics.track.useMutation();
  const getShareUrl = () => `${window.location.origin}/courses/${encodeURIComponent(courseSlug)}`;
  const share = (platform: "linkedin" | "whatsapp" | "email") => {
    const url = getShareUrl();
    const encodedUrl = encodeURIComponent(url);
    const destinations = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Explore ${courseTitle} from Profound IQ Consulting: ${url}`)}`,
      email: `mailto:?subject=${encodeURIComponent(`Course recommendation: ${courseTitle}`)}&body=${encodeURIComponent(`I thought you might find this Profound IQ Consulting course useful: ${url}`)}`,
    };
    trackShare.mutate({ eventName: "course_shared", metadata: { platform, courseSlug, pagePath: window.location.pathname } });
    window.open(destinations[platform], platform === "email" ? "_self" : "_blank", platform === "email" ? undefined : "noopener,noreferrer");
  };
  const copy = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShare.mutate({ eventName: "course_shared", metadata: { platform: "copy_link", courseSlug, pagePath: window.location.pathname } });
      toast.success("Course link copied", { description: "You can now paste it into a message or post." });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the course link", { description: url });
    }
  };
  const nativeShare = async () => {
    if (!navigator.share) return copy();
    try { await navigator.share({ title: courseTitle, text: `Explore ${courseTitle} from Profound IQ Consulting.`, url: getShareUrl() }); trackShare.mutate({ eventName: "course_shared", metadata: { platform: "native", courseSlug, pagePath: window.location.pathname } }); } catch { /* User cancellation is intentionally quiet. */ }
  };
  return <div className="mt-7 border-t border-[#16243d]/15 pt-5" aria-label={`Share ${courseTitle}`}><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-[#7d5e1e]"><Share2 size={14} /> Share this course</div><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => share("linkedin")} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><Linkedin size={14} /> LinkedIn</Button><Button type="button" variant="outline" size="sm" onClick={() => share("whatsapp")} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><MessageCircle size={14} /> WhatsApp</Button><Button type="button" variant="outline" size="sm" onClick={() => share("email")} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><Mail size={14} /> Email</Button><Button type="button" variant="outline" size="sm" onClick={nativeShare} className="border-[#16243d]/20 bg-transparent text-[#16243d]"><Copy size={14} /> {copied ? "Copied" : "Copy link"}</Button></div></div>;
}

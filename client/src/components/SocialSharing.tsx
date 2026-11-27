/* Profound IQ Consulting — accessible social sharing rail for reports, certificates, and pages. */
import { useState } from "react";
import { Copy, MessageCircle, Share2, X } from "lucide-react";
import { SocialIcon } from "@/components/SocialMediaIcons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type SocialPlatform =
  | "linkedin"
  | "x"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "whatsapp"
  | "email"
  | "copy"
  | "native";

export type { SocialPlatform };

type SocialSharingProps = {
  url: string;
  title: string;
  text?: string;
  summary?: string;
  image?: string;
  platforms?: SocialPlatform[];
  label?: string;
  className?: string;
  onShare?: (platform: SocialPlatform) => void;
};

const copy = {
  label: "Share",
  copied: "Copied",
  copyError: "Could not copy link",
  success: "Link copied",
};

const platformMeta: Record<
  SocialPlatform,
  { label: string; icon: React.ReactNode; shortLabel: string }
> = {
  linkedin: {
    label: "LinkedIn",
    shortLabel: "LinkedIn",
    icon: <SocialIcon platform="linkedin" />,
  },
  x: { label: "X", shortLabel: "X", icon: <X size={14} /> },
  facebook: {
    label: "Facebook",
    shortLabel: "Facebook",
    icon: <SocialIcon platform="facebook" />,
  },
  instagram: {
    label: "Instagram",
    shortLabel: "Instagram",
    icon: <SocialIcon platform="instagram" />,
  },
  tiktok: {
    label: "TikTok",
    shortLabel: "TikTok",
    icon: <SocialIcon platform="tiktok" />,
  },
  whatsapp: {
    label: "WhatsApp",
    shortLabel: "WhatsApp",
    icon: <MessageCircle size={14} />,
  },
  email: { label: "Email", shortLabel: "Email", icon: <Copy size={14} /> },
  copy: { label: "Copy link", shortLabel: "Copy", icon: <Copy size={14} /> },
  native: { label: "More", shortLabel: "More", icon: <Share2 size={14} /> },
};

export function SocialSharing({
  url,
  title,
  text,
  summary,
  image,
  platforms = [
    "linkedin",
    "x",
    "facebook",
    "instagram",
    "tiktok",
    "whatsapp",
    "copy",
    "native",
  ],
  label,
  className = "",
  onShare,
}: SocialSharingProps) {
  const [copied, setCopied] = useState(false);
  const shareText = summary || text || title;

  const buildDestination = (platform: SocialPlatform): string => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(shareText);
    switch (platform) {
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case "x":
        return `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      case "instagram":
        return `https://www.instagram.com/?url=${encodedUrl}`;
      case "tiktok":
        return `https://www.tiktok.com/share/video?url=${encodedUrl}&text=${encodedText}`;
      case "whatsapp":
        return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
      case "email":
        return `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
      default:
        return url;
    }
  };

  const handleShare = (platform: SocialPlatform) => {
    onShare?.(platform);
    if (platform === "copy") {
      handleCopy();
      return;
    }
    if (platform === "native") {
      handleNative();
      return;
    }
    const destination = buildDestination(platform);
    if (platform === "email") {
      window.location.href = destination;
    } else {
      window.open(destination, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(copy.success);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(copy.copyError);
    }
  };

  const handleNative = async () => {
    if (!navigator.share) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      /* User cancellation is intentionally quiet. */
    }
  };

  return (
    <div
      className={`mt-7 border border-border bg-card p-3 shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}
      aria-label={`${label ?? copy.label}: ${title}`}
    >
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-foreground">
        <Share2 size={14} /> {label ?? copy.label}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {platforms.map(platform => {
          const meta = platformMeta[platform];
          const isCopy = platform === "copy";
          return (
            <Button
              key={platform}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleShare(platform)}
              className="border-border bg-transparent text-foreground hover:bg-muted"
            >
              {meta.icon}{" "}
              {isCopy ? (copied ? copy.copied : meta.label) : meta.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

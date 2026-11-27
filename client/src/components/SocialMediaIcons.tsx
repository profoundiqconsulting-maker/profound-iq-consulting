import type { ReactNode } from "react";

export function SocialIcon({ platform }: { platform: string }) {
  const iconMap: Record<string, string> = {
    facebook: "/social/facebook.png",
    instagram: "/social/instagram.png",
    linkedin: "/social/linkedin.png",
    tiktok: "/social/tiktok.png",
    twitter: "/social/twitter.png",
    whatsapp: "/social/whatsapp.png",
  };

  const src = iconMap[platform];
  if (!src) return null;

  return <img src={src} alt={platform} width={20} height={20} loading="lazy" />;
}

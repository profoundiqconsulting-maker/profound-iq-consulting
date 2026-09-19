/* Profound IQ Consulting — responsive course image with WebP/AVIF fallbacks and srcset. */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ResponsiveImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  width?: number;
  height?: number;
  fetchPriority?: "high" | "low" | "auto";
  decoding?: "async" | "auto" | "sync";
};

function toWebp(src: string): string {
  if (src.endsWith(".webp") || src.endsWith(".svg")) return src;
  return `${src}.webp`;
}

function toAvif(src: string): string {
  if (src.endsWith(".avif") || src.endsWith(".svg")) return src;
  return `${src}.avif`;
}

export function ResponsiveImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
  width,
  height,
  fetchPriority = "auto",
  decoding = "async",
}: ResponsiveImageProps) {
  const [supportsAvif, setSupportsAvif] = useState<boolean | null>(null);
  const [supportsWebp, setSupportsWebp] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = (candidate: string): Promise<boolean> =>
      new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = candidate;
      });

    (async () => {
      const avif = await check(toAvif(src));
      if (cancelled) return;
      setSupportsAvif(avif);
      const webp = await check(toWebp(src));
      if (cancelled) return;
      setSupportsWebp(webp);
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  const sourceType = supportsAvif ? "image/avif" : supportsWebp ? "image/webp" : null;
  const canUsePicture = sourceType && (supportsWebp || supportsAvif);

  const aspectFallback =
    loading === "lazy" && width == null && height == null
      ? "aspect-[16/9] "
      : "";

  if (canUsePicture) {
    return (
      <picture className={className}>
        <source type={sourceType} srcSet={toWebp(src)} sizes={sizes} />
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding={decoding}
          className={cn("h-full w-full object-cover", aspectFallback)}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
      className={cn("h-full w-full object-cover", aspectFallback, className)}
    />
  );
}

export default ResponsiveImage;
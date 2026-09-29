import { useState, useMemo } from "react";
import { CourseCoverGenerator } from "@/components/CourseCoverGenerator";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/cover-people-practice_342ff6e3.svg";

type CourseCoverImageProps = {
  src: string;
  /** Course slug, used to render a deterministic cover when no image exists. */
  slug?: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  title?: string;
  width?: number;
  height?: number;
};

export function CourseCoverImage({
  src,
  slug,
  alt = "Course cover",
  className,
  loading,
  title,
  width,
  height,
}: CourseCoverImageProps) {
  const [error, setError] = useState(false);
  const [useGenerated, setUseGenerated] = useState(false);

  const generatedSlug = useMemo(() => {
    if (slug) return slug;
    if (!src) return "";
    const match = src.match(/\/cover-([^_/]+)/);
    return match ? match[1] : "";
  }, [slug, src]);

  if (!src || error || useGenerated) {
    if (generatedSlug) {
      return (
        <CourseCoverGenerator
          slug={generatedSlug}
          title={title}
          className={className}
          width={width}
          height={height}
        />
      );
    }
    const aspectFallback =
      loading === "lazy" && width == null && height == null
        ? "aspect-[16/9] "
        : "";
    return (
      <img
        src={PLACEHOLDER}
        alt={alt}
        className={cn(aspectFallback, className)}
        width={width}
        height={height}
        loading={loading}
        onError={() => setError(true)}
      />
    );
  }

  const aspectFallback =
    loading === "lazy" && width == null && height == null
      ? "aspect-[16/9] "
      : "";
  return (
    <img
      src={src}
      alt={alt}
      className={cn(aspectFallback, className)}
      width={width}
      height={height}
      loading={loading}
      onError={() => setUseGenerated(true)}
    />
  );
}

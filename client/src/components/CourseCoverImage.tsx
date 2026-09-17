import { useState, useMemo } from "react";
import { CourseCoverGenerator } from "@/components/CourseCoverGenerator";

const PLACEHOLDER = "/cover-placeholder_e7060957.svg";

type CourseCoverImageProps = {
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  title?: string;
  width?: number;
  height?: number;
};

export function CourseCoverImage({
  src,
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
    if (!src) return "";
    const match = src.match(/\/cover-([^_/]+)/);
    return match ? match[1] : "";
  }, [src]);

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
    return (
      <img
        src={PLACEHOLDER}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      onError={() => setUseGenerated(true)}
    />
  );
}

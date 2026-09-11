import { useState } from "react";

const PLACEHOLDER = "/cover-placeholder_e7060957.svg";

type CourseCoverImageProps = {
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function CourseCoverImage({
  src,
  alt = "Course cover",
  className,
  loading,
}: CourseCoverImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <img
        src={PLACEHOLDER}
        alt={alt}
        className={className}
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
      loading={loading}
      onError={() => setError(true)}
    />
  );
}

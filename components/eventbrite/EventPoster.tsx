import Image from "next/image";
import type { CSSProperties } from "react";

interface EventPosterProps {
  src: string | null;
  alt: string;
  sizes?: string;
  style?: CSSProperties;
  grayscale?: boolean;
}

export default function EventPoster({
  src,
  alt,
  sizes = "(max-width: 768px) 90vw, 420px",
  style,
  grayscale,
}: EventPosterProps) {
  return (
    <div style={{ position: "relative", background: "#181818", overflow: "hidden", ...style }}>
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          style={{ objectFit: "cover", filter: grayscale ? "grayscale(0.7) brightness(0.8)" : undefined }}
        />
      )}
    </div>
  );
}

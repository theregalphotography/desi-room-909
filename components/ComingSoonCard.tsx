import Image from "next/image";
import type { UpcomingTeaser } from "@/lib/contentful";

export default function ComingSoonCard({ teaser }: { teaser: UpcomingTeaser }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/5",
          border: "1px solid var(--color-cream-a25)",
          background: "#181818",
          overflow: "hidden",
        }}
      >
        {teaser.posterUrl && (
          <Image
            src={teaser.posterUrl}
            alt={teaser.title}
            fill
            sizes="(max-width: 768px) 90vw, 45vw"
            style={{ objectFit: "cover", opacity: 0.6, filter: "grayscale(0.4)" }}
          />
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, lineHeight: 1 }}>
          {teaser.title}
        </div>
        <div style={{ fontSize: 12, letterSpacing: "0.25em", color: "var(--color-cream-a70)", marginTop: 10 }}>
          {teaser.timing}
        </div>
      </div>
    </div>
  );
}

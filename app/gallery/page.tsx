import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import GalleryAlbums from "@/components/gallery/GalleryAlbums";
import { getEventGalleries, type EventGallery } from "@/lib/contentful";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Every shot our photographers took, from every room. Find your night, find your face, hit download — free, full resolution.",
  openGraph: {
    title: "Gallery — Desi Room 909",
    description: "Every shot our photographers took, from every room.",
  },
};

async function loadGalleries(): Promise<{ albums: EventGallery[]; error: boolean }> {
  try {
    return { albums: await getEventGalleries(), error: false };
  } catch {
    return { albums: [], error: true };
  }
}

export default async function GalleryPage() {
  const { albums, error } = await loadGalleries();

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)", color: "var(--color-cream)", fontFamily: "var(--font-body)" }}>
      <Header active="/gallery" />

      <div style={{ padding: "80px 44px 30px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.5em", color: "var(--color-lime)", marginBottom: 18 }}>
          THE AFTERMATH
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(56px,8vw,110px)",
            lineHeight: 0.9,
            letterSpacing: "0.03em",
            color: "transparent",
            WebkitTextStroke: "2px var(--color-cream)",
          }}
        >
          FIND YOURSELF
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--color-cream-a70)", maxWidth: 560, marginTop: 22 }}>
          Every shot our photographers took, from every room. Find your night, find your face, hit
          download — they&rsquo;re yours, full resolution, free.
        </div>
      </div>

      <div style={{ padding: "40px 44px 100px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 80 }}>
        {error && (
          <div style={{ border: "1px solid var(--color-cream-a25)", padding: "28px 32px", color: "var(--color-cream-a70)", fontSize: 14 }}>
            The gallery couldn&rsquo;t load right now. Check back shortly — new photos go up after every
            room.
          </div>
        )}

        {!error && albums.length === 0 && (
          <div style={{ border: "1px solid var(--color-cream-a25)", padding: "28px 32px", color: "var(--color-cream-a70)", fontSize: 14 }}>
            No galleries yet. First aftermath drops after the next room.
          </div>
        )}

        {albums.length > 0 && <GalleryAlbums albums={albums} />}

        <div
          style={{
            border: "1px solid var(--color-cream-a25)",
            padding: "36px 44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 18,
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, lineHeight: 1 }}>
              WANT IN ON THE NEXT ONE?
            </div>
            <div style={{ fontSize: 14, color: "var(--color-cream-a70)", marginTop: 8 }}>
              The camera comes out. Make sure you&rsquo;re in the frame.
            </div>
          </div>
          <Link
            href="/events"
            className="cta-btn"
            style={{ padding: "15px 32px", borderRadius: 999, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600 }}
          >
            UPCOMING ROOMS →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
